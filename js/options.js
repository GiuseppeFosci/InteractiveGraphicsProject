let difficulty = 0; // Initialize the difficulty variable
let gravity = 0;

// Add an event listener to the "Apply Settings" button to apply the settings
document.getElementById("applySettingsButton").addEventListener("click", () => {
   applySettings(); // Call the applySettings() function when the "Apply Settings" button is pressed
});

// Function to apply the settings
function applySettings() {
   // Retrieve the value of the settings slider and assign it to the difficulty variable
   difficulty = parseFloat(document.getElementById("speedRange").value) / 1000;
   //console.log("Selected difficulty value:", difficulty);

   gravity = parseFloat(document.getElementById("gravityRange").value);
   console.log("Selected difficulty value:", difficulty);
   

   
   // Retrieve the values of the X, Y, and Z coordinates sliders for the camera and assign them to their respective variables
   const cameraX = parseFloat(document.getElementById("cameraX").value);
   const cameraY = parseFloat(document.getElementById("cameraY").value);
   const cameraZ = parseFloat(document.getElementById("cameraZ").value);
   //console.log("Selected camera coordinates: X =", cameraX, ", Y =", cameraY, ", Z =", cameraZ);
   
   // Retrieve the state of the antialiasing checkbox and assign the value to a variable
   const antialiasing = document.getElementById("antialiasing").checked;
  // console.log("Antialiasing enabled:", antialiasing);
   
   // Retrieve the state of the fog checkbox and assign the value to a variable
   const enableFog = document.getElementById("enableFog").checked;
   //console.log("Fog enabled:", enableFog);

   // Retrieve the state of the ambient light checkbox and assign the value to a variable
   const ambientLightEnabled = document.getElementById("ambientLightCheckbox").checked;
   //console.log("Ambient Light enabled:", ambientLightEnabled);

   // Retrieve the state of the directional light checkbox and assign the value to a variable
   const directionalLightEnabled = document.getElementById("directionalLightCheckbox").checked;
   //console.log("Directional Light enabled:", directionalLightEnabled);

   // Retrieve the state of the point light checkbox and assign the value to a variable
   const pointLightEnabled = document.getElementById("pointLightCheckbox").checked;
   //console.log("Point Light enabled:", pointLightEnabled);

   // Retrieve the state of the spot light checkbox and assign the value to a variable
   const spotLightEnabled = document.getElementById("spotLightCheckbox").checked;
   //console.log("Spot Light enabled:", spotLightEnabled);


}
