const WebSocket = require('ws');
const express = require('express');
const http = require('http');  // Use http instead of https since Render provides SSL automatically

const app = express();
const server = http.createServer(app);  // Use http server instead of https
const wss = new WebSocket.Server({ server });

let connections = [];
let characters = generateInitialCharacters();  // Store the characters in memory

// Generate an initial set of characters (you can adjust this as needed)
function generateInitialCharacters() {
    const characters = [];
    const allChars = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y', 'z', '1', '2', '3', '4', '5',
        '6', '7', '8', '9', '0', '`', '-', '=', '[', ']', '\\',
        ';', "'", ',', '.', '/', '!', '@', '#', '$', '%', '^',
        '&', '*', '(', ')', '_', '+', '{', '}', '|', ':', '"',
        '<', '>', '?', '~', ' ', '\n'
    ];

    for (let i = 0; i < 8320; i++) {
        characters.push(allChars[i % allChars.length]);  // Repeat characters as needed
    }
    return characters;
}

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New client connected');
    connections.push(ws);

    // Send the initial state to the newly connected client
    ws.send(JSON.stringify({ type: 'initial', characters }));

    // When a message is received from a client
    ws.on('message', (message) => {
        console.log('Received message: ' + message);
        const data = JSON.parse(message);

        if (data.type === 'update') {
            // Update the character on the server
            characters[data.index] = data.char;

            // Broadcast the updated character to all other clients
            connections.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'update',
                        index: data.index,
                        char: data.char
                    }));
                }
            });
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        // Remove disconnected client from the list
        connections = connections.filter(client => client !== ws);
        console.log('Client disconnected');
    });
});

// Serve static files (index.html, CSS, JS)
app.use(express.static('public'));  // Make sure you have a 'public' folder with your frontend files

// Start the server
const port = process.env.PORT || 10000;  // Render assigns a dynamic port for your app
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
