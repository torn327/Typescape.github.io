const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let connections = [];

wss.on('connection', (ws) => {
    console.log('New client connected');
    connections.push(ws);

    // When a message is received from a client
    ws.on('message', (message) => {
        console.log('Received message: ' + message);

        // Broadcast the message to all other clients
        connections.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        connections = connections.filter(client => client !== ws);
        console.log('Client disconnected');
    });
});

// Serve static files (index.html, CSS, JS)
app.use(express.static('public'));

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
