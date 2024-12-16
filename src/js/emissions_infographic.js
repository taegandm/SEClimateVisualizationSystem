document.addEventListener("DOMContentLoaded", () => {
    const locationSelect = document.getElementById("emissionsLocationSelect");
    const yearSelect = document.getElementById("emissionsYearSelect");
    const chartCanvas = document.getElementById("chart1");

    if (!locationSelect || !yearSelect || !chartCanvas) {
        console.error("Required DOM elements are missing.");
        return;
    }

    let chart;

    // Load CSV data
    async function loadCSVData() {
        try {
            const response = await fetch("../data/ghg-emissions-by-sector.csv");
            const data = await response.text();
            return parseCSVData(data);
        } catch (error) {
            console.error("Error loading CSV data:", error);
            return [];
        }
    }

    // Parse CSV data into JSON
    function parseCSVData(data) {
        const rows = data.split("\n").filter(row => row.trim() !== "");
        const headers = rows[0].split(",").map(header => header.trim());

        return rows.slice(1).map(row => {
            const values = row.split(",").map(value => value.trim());
            return headers.reduce((obj, header, index) => {
                obj[header] = values[index] || "";
                return obj;
            }, {});
        });
    }

    // Populate dropdowns
    function populateDropdowns(data) {
        console.log("Populating dropdowns with data:", data); // Debugging

        const locations = Array.from(new Set(data.map(row => row["Entity"]))).filter(Boolean).sort();
        const years = Array.from(new Set(data.map(row => row["Year"]))).filter(Boolean).sort((a, b) => a - b);

        if (locations.length === 0 || years.length === 0) {
            console.error("No data available to populate dropdowns.");
            return;
        }

        locations.forEach(location => {
            const option = document.createElement("option");
            option.value = location;
            option.textContent = location;
            locationSelect.appendChild(option);
        });

        years.forEach(year => {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
    }

    // Filter data based on selections
    function filterData(data, location, year) {
        return data.filter(row => row["Entity"] === location && row["Year"] === year);
    }

    // Create or update the chart
    function createOrUpdateChart(data) {
        const labels = Object.keys(data).filter(key => key.startsWith("Greenhouse"));
        const chartLabels = ["Agriculture", "Land Use Change & Forestry", "Waste", "Buildings", "Industry", "Manufacturing & Construction", "Transport", "Electricity & Heat", "Other Fuel Combustion", "Bunker Fuels"];
        const values = labels.map(label => parseFloat(data[label]) || 0);

        // Unique colors for each sector
        const colors = [
            "#66c2a5", // Agriculture
            "#fc8d62", // Land Use Change & Forestry
            "#8da0cb", // Waste
            "#e78ac3", // Buildings
            "#a6d854", // Industry
            "#ffd92f", // Manufacturing & Construction
            "#e5c494", // Transport
            "#b3b3b3", // Electricity & Heat
            "#ff69b4", // Other Fuel Combustion
            "#6b486b"  // Bunker Fuels
        ];

        if (chart) {
            chart.data.labels = chartLabels;
            chart.data.datasets[0].data = values;
            chart.data.datasets[0].backgroundColor = colors;
            chart.update();
        } else {
            const ctx = chartCanvas.getContext("2d");
            chart = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: chartLabels,
                    datasets: [{
                        label: "Greenhouse Gas Emissions",
                        data: values,
                        backgroundColor: colors,
                        borderColor: colors.map(color => color.replace(")", ", 1)")), // Maintain matching borders
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: "Greenhouse Gas Emissions by Sector",
                            font: {
                                size: 18
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    // Event listeners for dropdown changes
    function setupEventListeners(data) {
        locationSelect.addEventListener("change", () => {
            const filteredData = filterData(
                data,
                locationSelect.value,
                yearSelect.value
            );
            if (filteredData.length > 0) createOrUpdateChart(filteredData[0]);
        });

        yearSelect.addEventListener("change", () => {
            const filteredData = filterData(
                data,
                locationSelect.value,
                yearSelect.value
            );
            if (filteredData.length > 0) createOrUpdateChart(filteredData[0]);
        });
    }

    // Initialize the page
    async function initialize() {
        const data = await loadCSVData();

        if (data.length === 0) {
            console.error("No data available to initialize the application.");
            return;
        }

        populateDropdowns(data);
        setupEventListeners(data);

        // Default chart (World and earliest year)
        locationSelect.value = "World";
        yearSelect.value = yearSelect.options[yearSelect.length - 1]?.value || "";
        const defaultData = filterData(data, "World", yearSelect.value);
        if (defaultData.length > 0) createOrUpdateChart(defaultData[0]);
    }

    initialize();
});
