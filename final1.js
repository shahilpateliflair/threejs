// // Global variables for Three.js scene and objects
// let scene, camera, renderer, controls, capModel;
// const raycaster = new THREE.Raycaster(); // For detecting clicked objects
// const mouse = new THREE.Vector2(); // Stores mouse position
// const partNames = {
//   // Mapping of cap parts to mesh names
//   main: "Main",
//   bill: "Bill",
//   button: "Button",
//   logo: "Logo",
// };
// let colors = {
//   // Default colors for each part
//   main: "#3366ff",
//   bill: "#000000",
//   button: "#ffffff",
//   logo: "#ff0000",
// };
// let selectedMesh = null,
//   floatingColorPicker = null; // Currently selected mesh and its color picker

// /**
//  * Initialize the Three.js scene, lights, camera, renderer, and load the 3D model
//  */
// let activeModel = null; // <-- Add this near the top, with your other globals

// function init() {
//   document.getElementById("loading").style.display = "block"; // Show loading indicator

//   // Create scene with light gray background
//   scene = new THREE.Scene();
//   scene.background = new THREE.Color(0xf0f0f0);

//   // Add ambient light for even illumination
//   scene.add(new THREE.AmbientLight(0xffffff, 0.6));

//   // Add two directional lights for better 3D perception
//   const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
//   light1.position.set(1, 1, 1);
//   scene.add(light1);

//   const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
//   light2.position.set(-1, -1, -1);
//   scene.add(light2);

//   // Create perspective camera (45° FOV, square aspect ratio)
//   camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
//   camera.position.set(0, 0, 5); // Position camera 5 units back

//   // Create WebGL renderer with antialiasing
//   renderer = new THREE.WebGLRenderer({
//     antialias: true,
//     alpha: true,
//     precision: "highp",
//   });
//   renderer.setPixelRatio(window.devicePixelRatio); // Improves clarity on HD/Retina screens
//   renderer.physicallyCorrectLights = true; // More realistic lighting
//   renderer.outputEncoding = THREE.sRGBEncoding; // Better color output
//   renderer.toneMapping = THREE.ACESFilmicToneMapping; // Filmic tone mapping for realism
//   renderer.toneMappingExposure = 1.2; // Slightly brighten the scene
//   renderer.setSize(window.innerWidth, window.innerHeight); // Fullscreen HD
//   renderer.shadowMap.enabled = true;
//   document.getElementById("container").appendChild(renderer.domElement);

//   // Add orbit controls for mouse interaction (rotate/zoom/pan)
//   controls = new THREE.OrbitControls(camera, renderer.domElement);
//   controls.enableDamping = true; // Smooth camera movement
//   controls.dampingFactor = 0.05;
//   controls.minDistance = -1; // Prevent zooming too close
//   controls.maxDistance = 2; // Prevent zooming too far

//   // Load the 3D model using GLTFLoader
//   new THREE.GLTFLoader().load(
//     "models/polo_white_tshirt.glb",
//     (gltf) => {
//       capModel = gltf.scene;
//       normalizeModel(capModel); // Scale and center the model

//       // Clone materials for each mesh so we can modify them independently
//       capModel.traverse(
//         (child) => child.isMesh && (child.material = child.material.clone())
//       );

//       scene.add(capModel);
//       activeModel = capModel; // <-- add this line to track active model

//       updateAllColors(); // Apply default colors
//       document.getElementById("loadOtherModel").textContent = "Check Tshirt Model"; // Add this line
//       document.getElementById("loading").style.display = "none";    },
//     (xhr) =>
//       console.log(((xhr.loaded / xhr.total) * 100).toFixed(2) + "% loaded"), // Progress callback
//     (error) => {
//       // Error callback
//       const el = document.getElementById("loading");
//       el.textContent = "Failed to load model. See console.";
//       el.style.backgroundColor = "#ff0000";
//       console.error("Failed to load model:", error);
//     }
//   );

//   // Set up color picker event listeners for each part
//   Object.keys(colors).forEach((k) =>
//     document.getElementById(k + "Color").addEventListener("input", (e) => {
//       colors[k] = e.target.value; // Update color when picker changes
//       !selectedMesh && updateAllColors(); // Update all parts if no specific part is selected
//     })
//   );

//   // Handle window resize (maintain square aspect ratio)
//   window.addEventListener("resize", () => {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
//   });

//   // Add click handler for selecting parts
//   renderer.domElement.addEventListener("click", onClick);

//   // Start animation loop
//   animate();
// }

// let secondModel = null; // Store reference to the second model

// document.getElementById("loadOtherModel").addEventListener("click", () => {
//   loadSecondModel();
// });
// function loadSecondModel() {
//   document.getElementById("loading").style.display = "block";

//   // If second model is already loaded, switch back to cap model
//   if (secondModel && activeModel === secondModel) {
//     scene.remove(secondModel);
//     scene.add(capModel);
//     activeModel = capModel;
//     updateAllColors();
//     document.getElementById("loadOtherModel").textContent = "Check Tshirt Model"; // Update button text
//     document.getElementById("loading").style.display = "none";
//     return;
//   }

//   // Remove the first model if present
//   if (capModel) {
//     scene.remove(capModel);
//   }

//   // Remove existing second model if already loaded
//   if (secondModel) {
//     scene.remove(secondModel);
//     secondModel.traverse((child) => {
//       if (child.isMesh) child.geometry.dispose();
//       if (child.material) child.material.dispose();
//     });
//     secondModel = null;
//   }

//   const loader = new THREE.GLTFLoader();
//   loader.load(
//     "models/tshirt (1).glb",
//     (gltf) => {
//       secondModel = gltf.scene;
//       normalizeModel(secondModel);
//       secondModel.traverse(
//         (child) => child.isMesh && (child.material = child.material.clone())
//       );
//       scene.add(secondModel);
//       activeModel = secondModel;
//       updateAllColors();
//       document.getElementById("loadOtherModel").textContent = "Check SpySport Model"; // Update button text
//       document.getElementById("loading").style.display = "none";
//     },
//     (xhr) =>
//       console.log(`Second model ${((xhr.loaded / xhr.total) * 100).toFixed(2)}% loaded`),
//     (error) => {
//       document.getElementById("loading").textContent = "Failed to load second model.";
//       console.error("Error loading second model:", error);
//     }
//   );
// }
// /**
//  * Normalize model size and position (center and scale to consistent size)
//  * @param {THREE.Object3D} model - The 3D model to normalize
//  */
// function normalizeModel(model) {
//   const box = new THREE.Box3().setFromObject(model); // Get bounding box
//   const size = box.getSize(new THREE.Vector3()); // Get dimensions
//   const scale = 1.5 / Math.max(size.x, size.y, size.z); // Calculate scale to fit
//   model.scale.set(scale, scale, scale); // Apply uniform scale

//   // Re-center the model after scaling
//   box.setFromObject(model);
//   const center = box.getCenter(new THREE.Vector3());
//   model.position.sub(center);
// }

// /**
//  * Update colors for all parts of the cap based on current color settings
//  */
// function updateAllColors() {
//   if (!activeModel) return;

//   activeModel.traverse((child) => {
//     if (child.isMesh) {
//       for (const part in partNames) {
//         if (child.name.includes(partNames[part])) {
//           child.material.color.set(colors[part]);
//         }
//       }
//     }
//   });
// }

// /**
//  * Animation loop - runs every frame
//  */
// function animate() {
//   requestAnimationFrame(animate);
//   controls.update(); // Update orbit controls
//   renderer.render(scene, camera); // Render the scene
// }

// /**
//  * Handle mouse clicks on the 3D model
//  * @param {MouseEvent} event - The click event
//  */
// function onClick(event) {
//   if (!capModel) return; // Exit if model not loaded

//   // Convert mouse coordinates to normalized device coordinates (-1 to +1)
//   const rect = renderer.domElement.getBoundingClientRect();
//   mouse.set(
//     ((event.clientX - rect.left) / rect.width) * 2 - 1,
//     -((event.clientY - rect.top) / rect.height) * 2 + 1
//   );

//   // Cast ray from camera through mouse position
//   raycaster.setFromCamera(mouse, camera);
//   const intersects = raycaster.intersectObjects(activeModel.children, true);

//   if (intersects.length) {
//     // If we hit something, select it and show color picker
//     selectedMesh = intersects[0].object;
//     const colorHex = "#" + selectedMesh.material.color.getHexString();
//     console.log(`Selected mesh: ${selectedMesh.name}, Color: ${colorHex}`);
//     showFloatingColorPicker(event.clientX, event.clientY);
//   } else {
//     // Clicked empty space - deselect
//     selectedMesh = null;
//     removeFloatingColorPicker();
//   }
// }

// /**
//  * Show a floating color picker at specified screen coordinates
//  * @param {number} x - Screen X coordinate
//  * @param {number} y - Screen Y coordinate
//  */
// function showFloatingColorPicker(x, y) {
//   removeFloatingColorPicker(); // Remove existing picker if any

//   // Create color input element
//   floatingColorPicker = document.createElement("input");
//   floatingColorPicker.type = "color";
//   floatingColorPicker.value = "#" + selectedMesh.material.color.getHexString();

//   // Position picker near mouse cursor
//   Object.assign(floatingColorPicker.style, {
//     position: "fixed",
//     left: x + 10 + "px",
//     top: y + 10 + "px",
//     zIndex: 1000,
//   });

//   // Handle color changes
//   floatingColorPicker.addEventListener("input", (e) => {
//     if (!selectedMesh) return;
//     const color = e.target.value;
//     console.log("Selected color:", color);

//     // Enable vertex colors if not already enabled
//     // Force material to MeshBasicMaterial to show exact color without lighting
//     selectedMesh.material = new THREE.MeshBasicMaterial({
//       vertexColors: true,
//       side: THREE.DoubleSide,
//     });
//     selectedMesh.material.needsUpdate = true;

//     // Apply color gradient across vertices
//     const geometry = selectedMesh.geometry;
//     if (geometry.isBufferGeometry) {
//       const position = geometry.attributes.position;

//       // Create color attribute if it doesn't exist
//       if (!geometry.attributes.color) {
//         geometry.setAttribute(
//           "color",
//           new THREE.BufferAttribute(new Float32Array(position.count * 3), 3)
//         );
//       }

//       // Set colors for all vertices exactly with selected color (no brightness variation)
//       const colors = geometry.attributes.color.array;
//       const baseColor = new THREE.Color(color);
//       for (let i = 0; i < position.count; i++) {
//         colors[i * 3] = baseColor.r;
//         colors[i * 3 + 1] = baseColor.g;
//         colors[i * 3 + 2] = baseColor.b;
//       }
//       geometry.attributes.color.needsUpdate = true; // Flag for update
//       geometry.attributes.color.needsUpdate = true; // Flag for update
//     }

//     console.log(`Changed color of ${selectedMesh.name} to ${color}`);
//   });

//   // Clean up when picker loses focus
//   floatingColorPicker.addEventListener("blur", () => {
//     removeFloatingColorPicker();
//     selectedMesh = null;
//   });

//   document.body.appendChild(floatingColorPicker);
//   floatingColorPicker.focus(); // Focus so it works immediately
// }

// /**
//  * Remove the floating color picker from DOM
//  */
// function removeFloatingColorPicker() {
//   floatingColorPicker?.remove(); // Safely remove if exists
//   floatingColorPicker = null;
// }

// // Start the application
// init();



// <!DOCTYPE html>
// <html lang="en">
//   <head>
//     <meta charset="UTF-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     <title></title>
//     <style>
//       body {
//         margin: 0;
//         overflow: hidden;
//         font-family: Arial, sans-serif;
//       }
//       #container {
//         justify-content: center;
//         display: block;
//         width: 200px;
//         height: 200px;
//         justify-items: center;
//         height: 100px;
//         display: flex;
//         touch-action: none;
//         margin-left: 247px;
//         margin-top: 90px;
//       }
//       #controls {
//         position: absolute;
//         top: 20px;
//         left: 20px;
//         background: rgba(255, 255, 255, 0.8);
//         padding: 15px;
//         border-radius: 8px;
//         box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
//         z-index: 100;
//         display: none !important;
//       }
//       .color-picker {
//         margin: 10px 0;
//       }
//       label {
//         display: block;
//         margin-bottom: 5px;
//         font-weight: bold;
//       }
//       #container {
//         justify-content: center;
//         display: block;
//         justify-items: center;
//         width: 400px;
//         height: 400px;
//         display: flex;
//         touch-action: none;
//         /* margin-left: 247px;
//         margin-top: 200px; */
//       }
//       #loading {
//         position: absolute;
//         top: 50%;
//         left: 50%;
//         transform: translate(-50%, -50%);
//         background: rgba(0, 0, 0, 0.7);
//         color: white;
//         padding: 20px;
//         border-radius: 8px;
//         display: none;
//       }
//       canvas {
//         width: 400px !important;
//         height: 400px !important;
//         margin-left: 450px;
//       }
//     </style>
//   </head>
//   <body>
//     <div id="container">
//       <div id="controls">
//         <h2>Cap Customizer</h2>

//         <div class="color-picker">
//           <label for="mainColor">Main Cap Color:</label>
//           <input type="color" id="mainColor" value="" />
//         </div>

//         <div class="color-picker">
//           <label for="billColor">Bill/Visor Color:</label>
//           <input type="color" id="billColor" value="" />
//         </div>

//         <div class="color-picker">
//           <label for="buttonColor">Button Color:</label>
//           <input type="color" id="buttonColor" value="" />
//         </div>

//         <div class="color-picker">
//           <label for="logoColor">Logo Color:</label>
//           <input type="color" id="logoColor" value="" />
//         </div>
//       </div>

//       <div id="loading">Loading 3D model...</div>
//     </div>
//     <button id="loadOtherModel" style="position:absolute; top:10px; right:10px; z-index: 200;">
//       Load Another Model
//     </button>
//     <!-- Import Three.js and necessary addons -->
//     <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js"></script>
//     <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/controls/OrbitControls.js"></script>
//     <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/loaders/GLTFLoader.js"></script>
//     <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/loaders/DRACOLoader.js"></script>

//     <script src="script.js"></script>
//   </body>
// </html>
