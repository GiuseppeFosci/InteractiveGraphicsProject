# Tower Stacker Game

## Overview

Tower Stacker is a 3D stacking game built using Three.js and Cannon.js. The objective of the game is to stack blocks as high as possible. The game features dynamic lighting, fog effects, and allows users to configure various settings such as lighting options, game difficulty, and gravity.

## Features

* **3D Graphics**: Utilizes Three.js for rendering 3D graphics.
* **Physics Engine**: Uses Cannon.js for realistic physics simulation.
* **Configurable Settings**: Users can adjust lighting, game difficulty, and gravity.
* **Autopilot Mode**: The game includes an autopilot mode for automatic play.
* **Dynamic Lighting**: Supports ambient, directional, point, and spot lights.
* **Fog Effects**: Optional fog effects for enhanced visual experience.

## Usage

### Controls

* **Spacebar**: Split the current block and add the next one.
* **R**: Restart the game.
* **Mouse Wheel**: Zoom in and out.

### Configuration

The game can be configured via the settings panel available in the user interface. The following settings are available:

* **Difficulty**: Adjust the speed of the blocks.
* **Antialiasing**: Enable or disable antialiasing.
* **Camera Position**: Set the X, Y, and Z coordinates of the camera.
* **Fog**: Enable or disable fog effects.
* **Lighting**: Toggle between ambient, directional, point, and spot lights.
* **Gravity**: Adjust the gravity affecting the blocks.

## Code Structure

* **index.html**: The main HTML file.
* **main.js**: The main JavaScript file containing the game logic.
* **styles.css**: The CSS file for styling the game.

### Key Functions

* **init()**: Initializes the game, sets up the scene, camera, renderer, and event listeners.
* **startGame()**: Resets the game state and starts a new game.
* **generateBox(x, y, z, width, depth, falls)**: Generates a new block with the specified dimensions and position.

## Development

This project uses the Live Server extension in Visual Studio Code for local development. To run the game locally, open the project in Visual Studio Code and start the Live Server to launch the game in your browser.

