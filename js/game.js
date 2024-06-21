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
let enableFog = false;
let perspective_camera; 
let cube_camera;
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

/*** EVENT HANDLER ***/
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
  enableFog = document.getElementById("enableFog").checked;
  console.log("Fog enabled updated to :", enableFog);
  if (scene) {
    if (enableFog) {
      const near = 5;
      const far = 10;
      const color = 0xefd1b5; // Colore della nebbia in esadecimale
      scene.background = new THREE.Color(0xaaaaaa); // Imposta uno sfondo grigio chiaro
      scene.fog = new THREE.Fog(color, near, far);   
    } else {
      scene.background = new THREE.Color(0x000000); // Imposta lo sfondo senza nebbia
      scene.fog = null; // Rimuovi la nebbia dalla scena
    }
  }
});

//window.addEventListener("mousedown", eventHandler);
window.addEventListener("touchstart", eventHandler); //Touchstart for touchdevices
window.addEventListener("keydown", function (event) {
  if (event.key == " ") {
    event.preventDefault();
    eventHandler();
    return;
  }
  if (event.key == "R" || event.key == "r") {
    //Prevent default behaviour
    event.preventDefault();
    this.setTimeout(2000);
    startGame();
    return;
  }
});

function eventHandler() {
  if (autopilot) startGame();
  else splitBlockAndAddNextOneIfOverlaps();
}

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
    //Define algorithm for collision, it is the basic metod for verify collision with every object in the world
    world.broadphase = new CANNON.NaiveBroadphase();
    //Max number of iteration managed
    world.solver.iterations = 40;
  
    // Initialize ThreeJs
    const aspect = window.innerWidth / window.innerHeight;
    const width = 12  ;
    const height = width / aspect;
  
    if (perspective_camera == false ){
    camera = new THREE.OrthographicCamera(
      width / -2    , // left
      width / 2, // right
      height / 1    , // top
      height / -2, // bottom
      0, // near plane
      100 // far plane
    );
  }
  //TODO ENABLE OPTION OF PROSPECTIVE CAMERA
    // If you want to use perspective camera instead, uncomment these lines
    if (perspective_camera == true )
     camera = new THREE.PerspectiveCamera(
      45, // field of view
      aspect, // aspect ratio
      1, // near plane
      100 // far plane
    );
    
    if (scene) {
      if (fog) {
        const near = 5;
        const far = 10;
        const color = 0xefd1b5; // Colore della nebbia in esadecimale
        scene.background = new THREE.Color(0xaaaaaa); 
        scene.fog = new THREE.Fog(color, near, far);   
      } else {
        scene.background = new THREE.Color(0xaaaaaa); // Imposta lo sfondo senza nebbia
        scene.fog = null; 
      }
    }
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
          newDepth = topLayer.depth; // Keep the depth same as the original depth
          // Update the scale and position of the topLayer along the x-axis
          topLayer.threejs.scale.x = overlap / size;
          topLayer.threejs.position.x -= delta / 2;
          // Update the position of the topLayer along the x-axis in the CannonJS model
          topLayer.cannonjs.position.x -= delta / 2;
      } else {
          newWidth = topLayer.width; // Keep the width same as the original width
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
      Replace the shape with a smaller one in CannonJS, it's like a physics 
      update of block dimension
      */
      const shape = new CANNON.Box(
        new CANNON.Vec3(newWidth / 2, boxHeight / 2, newDepth / 2)
      );
  
      /* 
      Remove all already existing shapes from the block, and now the block 
      reflects the correct dimensions. 
      We need this otherwise the physics object may have overlapping shapes
      */
      topLayer.cannonjs.shapes = [];  
      topLayer.cannonjs.addShape(shape);
  }
  
    

function splitBlockAndAddNextOneIfOverlaps() {
  // Verifica se il gioco è terminato
  if (gameEnded == true) {
      return; // Esce dalla funzione se il gioco è terminato
  }

  // Ottiene il layer superiore (topLayer) e il layer precedente (previousLayer) dalla pila (stackOnTop)
  const topLayer = stackOnTop[stackOnTop.length - 1];
  const previousLayer = stackOnTop[stackOnTop.length - 2];

  // Determina la direzione del topLayer
  const direction = topLayer.direction;

  // Calcola size (dimensione) e delta (differenza) in base alla direzione del topLayer
  let size, delta;
  if (direction === "x") {
      size = topLayer.width;
      delta = topLayer.threejs.position.x - previousLayer.threejs.position.x;
  } else { // direction === "z"
      size = topLayer.depth;
      delta = topLayer.threejs.position.z - previousLayer.threejs.position.z;
  }

  // Calcola la dimensione dell'overhang e l'overlap
  const overhangSize = Math.abs(delta);
  const overlap = size - overhangSize;

  // Esegue la funzione cutBox solo se c'è un overlap positivo
  if (overlap > 0) {
      cutBox(topLayer, overlap, size, delta);

      // Calcola le coordinate e le dimensioni dell'overhang
      let overhangX, overhangZ, overhangWidth, overhangDepth;
      // Calcola lo spostamento dell'overhang in base alla direzione
      const overhangShift = (overlap / 2 + overhangSize / 2) * Math.sign(delta);

      if (direction == "x") {
          // Se la direzione è "x", l'overhang si sposta sull'asse x e rimane sulla stessa posizione z
          overhangX = topLayer.threejs.position.x + overhangShift;
          overhangZ = topLayer.threejs.position.z;
          overhangWidth = overhangSize;
          overhangDepth = topLayer.depth;
      } else { // direction === "z"
          // Se la direzione è "z", l'overhang si sposta sull'asse z e rimane sulla stessa posizione x
          overhangX = topLayer.threejs.position.x;
          overhangZ = topLayer.threejs.position.z + overhangShift;
          overhangWidth = topLayer.width;
          overhangDepth = overhangSize;
      }

      // Aggiunge l'overhang alla scena
      addOverhang(overhangX, overhangZ, overhangWidth, overhangDepth);

      // Calcola le coordinate e la direzione del prossimo layer
      let nextX, nextZ, nextDirection;
      if (direction == "x") {
          // Se la direzione è "x", il prossimo layer si sposta lungo l'asse z
          nextX = topLayer.threejs.position.x;
          nextZ = -10;
          nextDirection = "z";
      } else { // direction === "z"
          // Se la direzione è "z", il prossimo layer si sposta lungo l'asse x
          nextX = -10;
          nextZ = topLayer.threejs.position.z;
          nextDirection = "x";
      }

      const newWidth = topLayer.width; // Il nuovo layer ha la stessa larghezza del topLayer tagliato
      const newDepth = topLayer.depth; // Il nuovo layer ha la stessa profondità del topLayer tagliato

      // Aggiorna il punteggio (score) se l'elemento scoreElement è definito
      if (scoreElement) {
          scoreElement.innerText = stackOnTop.length - 1;
      }

      // Aggiunge il nuovo layer alla scena
      addLayer(nextX, nextZ, newWidth, newDepth, nextDirection);
  } else {
      missedTheSpot(); // Se l'overlap è 0, il giocatore ha mancato il punto
  }
}


function missedTheSpot() {
    const topLayer = stackOnTop[stackOnTop.length - 1];
    
    gameEnded = true;
    // Turn to top layer into an overhang and let it fall down
    addOverhang(
      topLayer.threejs.position.x,
      topLayer.threejs.position.z,
      topLayer.width,
      topLayer.depth
    );
  
    //Remove mesh and physics object associated to it 
    world.removeBody(topLayer.cannonjs);
    scene.remove(topLayer.threejs);
  
    //Result element if it exist in index.html
    if (resultsElement) resultsElement.style.display = "flex";
}

function animation(time) {
  if (lastTime) {
    const timePassed = time - lastTime;
    const speed = difficulty;

    const topLayer = stackOnTop[stackOnTop.length - 1];
    const previousLayer = stackOnTop[stackOnTop.length - 2];

    // The top level box should move if the game has not ended AND
    // it's either NOT in autopilot or it is in autopilot and the box did not yet reach the robot position
    const boxShouldMove =
      !gameEnded &&
      (!autopilot ||
        (autopilot &&
          topLayer &&
          topLayer.threejs.position[topLayer.direction] <
            previousLayer.threejs.position[topLayer.direction] +
              robotPrecision));

    if (boxShouldMove) {
      // Keep the position visible on UI and the position in the model in sync
      topLayer.threejs.position[topLayer.direction] += speed * timePassed;
      topLayer.cannonjs.position[topLayer.direction] += speed * timePassed;

      // If the box went beyond the stackOnTop then show up the fail screen
      if (topLayer && topLayer.threejs.position[topLayer.direction] > 10) {
        missedTheSpot();
      }
    } else {
      // If it shouldn't move then is it because the autopilot reached the correct position?
      // Because if so then next level is coming
      if (autopilot) {
        splitBlockAndAddNextOneIfOverlaps();
        setRobotPrecision();
      }
    }

    // Adjust camera position
    adjustCameraPosition(speed, timePassed, stackOnTop, boxHeight);


    updatePhysics(timePassed);
    renderer.render(scene, camera);
  }
  lastTime = time;
}


    
    
function adjustCameraPosition(speed, timePassed, stackOnTop, boxHeight) {
    const cameraTargetY = boxHeight * (stackOnTop.length - 2) + 4;
    if (camera.position.y < cameraTargetY) {
      camera.position.y += speed * timePassed;
    }
  }

  function updatePhysics(timePassed) { 
    // Step the physics world based on the time passed (in seconds)
    world.step(timePassed / 1000);
  
    // Copy coordinates from Cannon.js to Three.js for each overhang object
    overhangs.forEach((element) => {
      // Copy the position (x, y, z) from Cannon.js to Three.js

      /*Visual position of the the box update accordly with physical
      position simulated by Cannon
      */
      element.threejs.position.copy(element.cannonjs.position);
      
      // Copy the quaternion (orientation) from Cannon.js to Three.js
      element.threejs.quaternion.copy(element.cannonjs.quaternion);
    });
  }
  




  





  