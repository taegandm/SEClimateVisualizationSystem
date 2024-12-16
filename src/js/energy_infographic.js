document.addEventListener("DOMContentLoaded", () => {
    const locationSelect = document.getElementById("energyLocationSelect");
    const chartCanvas = document.getElementById("chart2");

    if (!locationSelect || !chartCanvas) {
        console.error("Required DOM elements are missing.");
        return;
    }

    let chart;

    // Load CSV Data
    async function loadCSVData() {
        try {
            const response = await fetch("../data/modern-renewable-prod.csv");
            const data = await response.text();
            return parseCSVData(data);
        } catch (error) {
            console.error("Error loading CSV data:", error);
            return [];
        }
    }

    // Parse CSV Data
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

    // Populate Dropdown
    function populateDropdown(data) {
        const entities = Array.from(new Set(data.map(row => row["Entity"]))).filter(Boolean).sort();

        entities.forEach(entity => {
            const option = document.createElement("option");
            option.value = entity;
            option.textContent = entity;
            locationSelect.appendChild(option);
        });
    }

    // Filter Data by Entity
    function filterDataByEntity(data, entity) {
        return data.filter(row => row["Entity"] === entity);
    }

    // Create or Update the Line Chart
    function createOrUpdateChart(data) {
        const years = data.map(row => row["Year"]);
        const wind = data.map(row => parseFloat(row["Electricity from wind - TWh"]) || 0);
        const hydro = data.map(row => parseFloat(row["Electricity from hydro - TWh"]) || 0);
        const solar = data.map(row => parseFloat(row["Electricity from solar - TWh"]) || 0);
        const otherRenewables = data.map(row => parseFloat(row["Other renewables including bioenergy - TWh"]) || 0);

        if (chart) {
            chart.destroy();
        }

        const ctx = chartCanvas.getContext("2d");
        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: years,
                datasets: [
                    {
                        label: "Wind",
                        data: wind,
                        borderColor: "#2ca02c",
                        backgroundColor: "rgba(44, 160, 44, 0.2)",
                        fill: true
                    },
                    {
                        label: "Hydro",
                        data: hydro,
                        borderColor: "#1f77b4",
                        backgroundColor: "rgba(31, 119, 180, 0.2)",
                        fill: true
                    },
                    {
                        label: "Solar",
                        data: solar,
                        borderColor: "#ff7f0e",
                        backgroundColor: "rgba(255, 127, 14, 0.2)",
                        fill: true
                    },
                    {
                        label: "Other Renewables",
                        data: otherRenewables,
                        borderColor: "#9467bd",
                        backgroundColor: "rgba(148, 103, 189, 0.2)",
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: "Renewable Electricity Generation by Source",
                        font: { size: 18 }
                    },
                    legend: {
                        display: true,
                        position: "bottom"
                    }
                },
                scales: {
                    x: { title: { display: true, text: "Year" } },
                    y: { title: { display: true, text: "Energy (TWh)" }, beginAtZero: true }
                }
            }
        });
    }

    // Event Listener for Dropdown
    function setupEventListeners(data) {
        locationSelect.addEventListener("change", () => {
            const filteredData = filterDataByEntity(data, locationSelect.value);
            if (filteredData.length > 0) createOrUpdateChart(filteredData);
        });
    }

    // Initialize Chart
    async function initialize() {
        const data = await loadCSVData();
        if (data.length === 0) {
            console.error("No data available.");
            return;
        }

        populateDropdown(data);
        setupEventListeners(data);

        // Default chart (first location)
        locationSelect.value = "World";
        const defaultData = filterDataByEntity(data, "World");
        if (defaultData.length > 0) createOrUpdateChart(defaultData);
    }

    initialize();
});
