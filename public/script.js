// Define all characters (including symbols)
const characters = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
    'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
    'u', 'v', 'w', 'x', 'y', 'z', '1', '2', '3', '4', '5',
    '6', '7', '8', '9', '0', '`', '-', '=', '[', ']', '\\',
    ';', "'", ',', '.', '/', '!', '@', '#', '$', '%', '^',
    '&', '*', '(', ')', '_', '+', '{', '}', '|', ':', '"',
    '<', '>', '?', '~', ' ', '\n'
];

// Total number of characters (5,000 in total)
const totalBoxes = 8320;

// Create grid elements dynamically
const gridContainer = document.querySelector('.grid-container');

// Function to generate an array of characters for 8320 boxes (repeat the characters as needed)
const generateCharacters = (total) => {
    const result = [];
    while (result.length < total) {
        result.push(...characters);
    }
    return result.slice(0, total);
};

// Generate characters to be placed in the grid
const allCharacters = generateCharacters(totalBoxes);

// Create a document fragment for better performance during DOM updates
const fragment = document.createDocumentFragment();

// Connect to the WebSocket server
const socket = new WebSocket('ws://' + window.location.hostname + ':3000'); // Modify for Render deployment if necessary

// Listen for messages from the server (throttled for performance)
let lastUpdateTime = 0;
const updateInterval = 100; // Milliseconds to throttle updates

socket.addEventListener('message', function (event) {
    const currentTime = Date.now();
    if (currentTime - lastUpdateTime < updateInterval) return; // Throttle updates to prevent too many

    lastUpdateTime = currentTime;

    const updatedChar = JSON.parse(event.data);
    const charIndex = updatedChar.index;

    // Update the corresponding character input on the page
    const characterDiv = document.querySelector(`.character[data-index="${charIndex}"] input`);
    if (characterDiv) {
        characterDiv.value = updatedChar.char;
    }
});

// Function to create and display the grid
allCharacters.forEach((char, index) => {
    const div = document.createElement('div');
    div.classList.add('character');
    div.dataset.index = index;  // Store the index to identify the character

    // Create an input field for each character
    const input = document.createElement('input');
    input.classList.add('character-input');
    input.value = char;  // Set initial character as the value
    input.maxLength = 1;  // Ensure only one character can be typed
    input.dataset.index = index;  // Store the index to identify the character

    // Add the input field to the div
    div.appendChild(input);

    // Add click event listener to select the character and focus on input
    div.addEventListener('click', () => {
        input.focus();  // Focus on the input when the character is clicked
    });

    // Add event listener for keydown to replace character directly
    input.addEventListener('keydown', (event) => {
        if (event.key.length === 1) {  // Only proceed if it's a single character key
            input.value = event.key;  // Directly replace the character

            // Send the updated character to the server
            socket.send(JSON.stringify({ index: index, char: event.key }));
        }
    });

    // Append the div to the fragment for batch DOM insertion
    fragment.appendChild(div);
});

// Once all elements are created, append them to the grid container
gridContainer.appendChild(fragment);
