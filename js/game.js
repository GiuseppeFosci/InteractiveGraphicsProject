import * as THREE from 'three';
import * as CANNON from 'cannon-es';

window.focus(); // Capture keys right away (by default focus is on editor)

let camera, scene, renderer; // ThreeJS globals
let world; // CannonJs world

let lastTime; // Last timestamp of animation
let stackOnTop; // Parts that stay solid on top of each other
let overhangs; // Overhanging parts that fall down
const boxHeight = 1; // Height of each layer
const originalBoxSize = 3; // Original width and height of a box
let autopilot;
let gameEnded;
let robotPrecision; // Determines how precise the game is on autopilot

const scoreElement = document.getElementById("score");
const instructionsElement = document.getElementById("instructions");
const resultsElement = document.getElementById("results");


//SETTINGS
let antialias_setting = true;
let alpha;

let perspective_camera; 
let difficulty = 0.008;
let precision = 'highp';       // Precisione alta per gli shader
let gravity = 9.8;

let cameraX = 4;
let cameraY = 4;
let cameraZ = 4;

/*
// Gestione dello zoom in e out con la rotella del mouse
window.addEventListener("wheel", function(event) {
    // Calcola lo spostamento della telecamera basato sul movimento della rotella del mouse
    let zoomAmount = event.deltaY * 0.1; // Modifica questo valore per regolare la velocità dello zoom

    // Aggiorna la posizione della telecamera
    camera.position.z += zoomAmount;
});
*/



init();

// Aggiorna la variabile difficulty, perspective_camera, antialiasing e gravity quando si preme il pulsante "Apply Settings"
document.getElementById("applySettingsButton").addEventListener("click", () => {
  difficulty = parseFloat(document.getElementById("speedRange").value) / 1000;
  console.log("Difficulty updated to:", difficulty); // Stampa il valore aggiornato per il debug
  perspective_camera = document.getElementById("perspective_camera").checked;
  console.log("Perspective Camera updated to:", perspective_camera);
  antialias_setting = document.getElementById("antialiasing").checked;
  console.log("Antialiasing:", antialias_setting);
  cameraX = parseFloat(document.getElementById("cameraX").value);
  cameraY = parseFloat(document.getElementById("cameraY").value);
  cameraZ = parseFloat(document.getElementById("cameraZ").value);
  console.log("Camera coordinates updated to: X =", cameraX, ", Y =", cameraY, ", Z =", cameraZ);
});