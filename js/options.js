let difficulty = 0; // Initialize the difficulty variable
let gravity = 9.8;

// Add an event listener to the "Apply Settings" button to apply the settings
document.getElementById("applySettingsButton").addEventListener("click", () => {
   applySettings(); // Call the applySettings() function when the "Apply Settings" button is pressed
});

// Function to apply the settings
function applySettings() {
   // Retrieve the value of the settings slider and assign it to the difficulty variable
   difficulty = parseFloat(document.getElementById("speedRange").value) / 1000;
   console.log("Selected difficulty value:", difficulty);
   
   // Retrieve the state of the perspective camera checkbox and assign the value to a variable
   const perspective_camera = document.getElementById("perspective_camera").checked;
   console.log("Selected Perspective Camera:", perspective_camera);
   
   // Retrieve the values of the X, Y, and Z coordinates sliders for the camera and assign them to their respective variables
   const cameraX = parseFloat(document.getElementById("cameraX").value);
   const cameraY = parseFloat(document.getElementById("cameraY").value);
   const cameraZ = parseFloat(document.getElementById("cameraZ").value);
   console.log("Selected camera coordinates: X =", cameraX, ", Y =", cameraY, ", Z =", cameraZ);
   
   // Retrieve the state of the antialiasing checkbox and assign the value to a variable
   const antialiasing = document.getElementById("antialiasing").checked;
   console.log("Antialiasing enabled:", antialiasing);
     // Retrieve the state of the fog checkbox and assign the value to a variable
     const enableFog = document.getElementById("enableFog").checked;
     console.log("Fog enabled:", enableFog);
   
}
