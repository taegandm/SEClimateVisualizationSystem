import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import open from 'open';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

// Helper to resolve the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

// Content-Type mapping for static files
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

// Create the HTTP server
const server = createServer(async (req, res) => {
    let urlPath = req.url;

    // Default to serving index.html for root or /src/
    if (urlPath === '/' || urlPath === '/src/') {
        urlPath = '/src/index.html';
    }

    // Resolve the file path
    const filePath = join(__dirname, urlPath);

    try {
        // Read the file and determine its content type
        const data = await readFile(filePath);
        const ext = extname(filePath);
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        // Serve the file
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    } catch (err) {
        // File not found or error
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
    }
});

// Attach WebSocket server
const wss = new WebSocketServer({ server });

let isBrowserOpen = false;

wss.on('connection', (ws) => {
    console.log('Browser connected');
    isBrowserOpen = true;

    ws.on('close', () => {
        console.log('Browser closed');
        isBrowserOpen = false;

        setTimeout(() => {
            if (!isBrowserOpen) {
                console.log('Shutting down server...');
                server.close();
                process.exit();
            }
        }, 1000);
    });
});

// Start the server
const PORT = 8000;
server.listen(PORT, async () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    await open(`http://localhost:${PORT}`);
});
