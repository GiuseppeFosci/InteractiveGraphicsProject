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

// Determines how precise the game is on autopilot
function setRobotPrecision() {
    robotPrecision = Math.random() * 1 - 0.5;
  }
  
  function init() {
    autopilot = true;
    gameEnded = false;
    lastTime = 0;
    stackOnTop = [];
    overhangs = [];
    setRobotPrecision();
    perspective_camera = false;
  
  
    // Initialize CannonJS
    world = new CANNON.World();
    world.gravity.set(0, -gravity , 0); // Gravity pulls things down
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 40;
  
    // Initialize ThreeJs
    const aspect = window.innerWidth / window.innerHeight;
    const width = 12  ;
    const height = width / aspect;
  
    camera = new THREE.OrthographicCamera(
      width / -2    , // left
      width / 2, // right
      height / 1    , // top
      height / -2, // bottom
      0, // near plane
      100 // far plane
    );
  //TODO ENABLE OPTION OF PROSPECTIVE CAMERA
    // If you want to use perspective camera instead, uncomment these lines
    if (perspective_camera == true )
     camera = new THREE.PerspectiveCamera(
      45, // field of view
      aspect, // aspect ratio
      1, // near plane
      100 // far plane
    );
    
  
    camera.position.set(cameraX, cameraY, cameraZ);
    camera.lookAt(0, 0, 0);
  
    scene = new THREE.Scene();
  
    // Foundation
    addLayer(0, 0, originalBoxSize, originalBoxSize);
  
    // First layer
    addLayer(-10, 0, originalBoxSize, originalBoxSize, "x");
  
    // Set up lights
    //Ambient light with white colour and intensity of 60%, uniform way (all object in same way)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
  
    //Directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(10, 20, 0);
    scene.add(dirLight);
  
    // Set up renderer
    renderer = new THREE.WebGLRenderer({ 
      antialias: antialias_setting,
      alpha:false,        // Abilita la trasparenza del canvas
      precision: 'highp',             // Precisione alta per gli shader
      
    
    
  
    });
  
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animation);
    document.body.appendChild(renderer.domElement);
  
    
  }

  function startGame() {
    autopilot = false; // Disable autopilot mode
    gameEnded = false; // Reset the game ended flag
    lastTime = 0; // Reset the last timestamp of animation
    stackOnTop = []; // Clear the stack of parts on top
    overhangs = []; // Clear the overhanging parts
  
    if (camera) {
      // Reset camera positions
      camera.position.set(cameraX, cameraY, cameraZ); // Set camera position
      camera.lookAt(0, 0, 0); // Set camera target
    }
  
    // Hide instructions element if it exists
    if (instructionsElement) instructionsElement.style.display = "none";
    // Hide results element if it exists
    if (resultsElement) resultsElement.style.display = "none";
    // Reset the score element to 0
    if (scoreElement) scoreElement.innerText = 0;
  

    /*
    In CannonJS, the world is composed by set of object calles "bodies"
    Every body has own geometry with own geometries like mass, position ecc
    */
    if (world) {
      // Remove every object from the CannonJS world

      while (world.bodies.length > 0) {
        world.removeBody(world.bodies[0]);
      }
    }
    

    /*When we restart a game we want to remove all the block,
    the block are of type mesh, so we find all the block and
    remove it from the scene.

    */
    if (scene) {
      // Remove every Mesh from the ThreeJS scene
      while (scene.children.find((c) => c.type == "Mesh")) {
        const mesh = scene.children.find((c) => c.type == "Mesh");
        scene.remove(mesh);
      }
  
      // Rebuild the foundation
      addLayer(0, 0, originalBoxSize, originalBoxSize);
  
      // Add the first layer
      addLayer(-10, 0, originalBoxSize, originalBoxSize, "x");
    }
  }
  
  /*
  Generate a box with posizion , width, depth and a booleand variable
  falls, used to indicate if box must falls or not 
  */
  function generateBox(x, y, z, width, depth, falls) {
    // ThreeJS
    const geometry = new THREE.BoxGeometry(width, boxHeight, depth);
    const color = new THREE.Color(`hsl(${30 + stackOnTop.length * 4}, 100%, 50%)`);
    const material = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    scene.add(mesh);
  
    /* CannonJS

    We create same box with halved size, 
    to favor collection algorithms
    */
    const shape = new CANNON.Box(
      new CANNON.Vec3(width / 2, boxHeight / 2, depth / 2)
    );

    let mass = falls ? 5 : 0; // If it shouldn't fall then setting the mass to zero will keep it stationary
    mass *= width / originalBoxSize; // Reduce mass proportionately by size
    mass *= depth / originalBoxSize; // Reduce mass proportionately by size
    //Creation of new physics body using the shape and the mass compute as soon as
    const body = new CANNON.Body({ mass, shape });
    /*Block position behind physics world,
      same position of threejs box
    */
    body.position.set(x, y, z);
    world.addBody(body);
  
    //We turn object composed by:
    return {
      threejs: mesh, //Mesh type object (Box)
      cannonjs: body, //Physics block
      width,
      depth
    };

  }

  function addLayer(x, z, width, depth, direction) {
    const y = boxHeight * stackOnTop.length; // Add the new box one layer higher
    //Initially the box must not fall, so they aren't subject to force of gravity
    const layer = generateBox(x, y, z, width, depth, false);
    layer.direction = direction;
    stackOnTop.push(layer); 
  }


  /*
  It compute the vertical position of overhang(sporgenza)
  based on the height of block times  
  - boxHeight: is the default height of each block.
  -stackOnTop.length: returns the number of blocks currently on the stack. 
  By multiplying the height of each block (boxHeight) by the number of blocks in the stack, 
  we get the total height up to the new block.
  */
  function addOverhang(x, z, width, depth) {
    //If i add a positive number here, block will falls "too high"
    const y = boxHeight * (stackOnTop.length - 1); 
    const overhang = generateBox(x, y, z, width, depth, true);
    //Adds the newly created overhang block to the overhangs array to keep track of it.
    overhangs.push(overhang);
  }


  /*
  Manage cut of overlying block
    topLayer : upper block to be cut
    overlap : The length of the overlapping part of the block 
    size : original dimension of bloc
    delta: Difference of position ( x or z ) of upper block and inferior block


  */
  function cutBox(topLayer, overlap, size, delta) {
    // Extract the direction of the topLayer
    const direction = topLayer.direction;
  
    let newWidth, newDepth;
  
    // Calculate new dimensions based on the cutting direction
    if (direction == "x") {
      newWidth = overlap;
      newDepth = topLayer.width;
      // Update the scale and position of the topLayer along the x-axis
      topLayer.threejs.scale.x = overlap / size;
      topLayer.threejs.position.x -= delta / 2;
      // Update the position of the topLayer along the x-axis in the CannonJS model
      topLayer.cannonjs.position.x -= delta / 2;
    } else {
      newWidth = topLayer.width;
      newDepth = overlap;
      // Update the scale and position of the topLayer along the z-axis
      topLayer.threejs.scale.z = overlap / size;
      topLayer.threejs.position.z -= delta / 2;
      // Update the position of the topLayer along the z-axis in the CannonJS model
      topLayer.cannonjs.position.z -= delta / 2;
    }
  
    // Update the dimensions of the topLayer
    topLayer.width = newWidth;
    topLayer.depth = newDepth;
  
    /* 
    Now we must do similar in CannonJs
    Replace the shape with a smaller one in CannonJS, it's like a physiscs 
    update of block dimension
    
    */
    const shape = new CANNON.Box(
      new CANNON.Vec3(newWidth / 2, boxHeight / 2, newDepth / 2)
    );
    /*Remove all already exist shape for the block, and now the block 
    reflect correct dimensions. 
    we need this otherwise the physics object may have overlayed shapes

    */
    topLayer.cannonjs.shapes = [];  
    
    
    topLayer.cannonjs.addShape(shape);
}



  





  