// Global variables for Three.js scene and objects
let scene, camera, renderer, controls, capModel;
const raycaster = new THREE.Raycaster(); // For detecting clicked objects
const mouse = new THREE.Vector2(); // Stores mouse position
const partNames = {
  // Mapping of cap parts to mesh names
  main: "Main",
  bill: "Bill",
  button: "Button",
  logo: "Logo",
};
let colors = {
  // Default colors for each part
  main: "#3366ff",
  bill: "#000000",
  button: "#ffffff",
  logo: "#ff0000",
};
let selectedMesh = null,
  floatingColorPicker = null; // Currently selected mesh and its color picker

/**
 * Initialize the Three.js scene, lights, camera, renderer, and load the 3D model
 */
let activeModel = null; // <-- Add this near the top, with your other globals

function init() {
  document.getElementById("loading").style.display = "block"; // Show loading indicator

  // Create scene with light gray background
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // Add ambient light for even illumination
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  // Add two directional lights for better 3D perception
  const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
  light1.position.set(1, 1, 1);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
  light2.position.set(-1, -1, -1);
  scene.add(light2);

  // Create perspective camera (45° FOV, square aspect ratio)
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(0, 0, 5); // Position camera 5 units back

  // Create WebGL renderer with antialiasing
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    precision: "highp",
  });
  renderer.setPixelRatio(window.devicePixelRatio); // Improves clarity on HD/Retina screens
  renderer.physicallyCorrectLights = true; // More realistic lighting
  renderer.outputEncoding = THREE.sRGBEncoding; // Better color output
  renderer.toneMapping = THREE.ACESFilmicToneMapping; // Filmic tone mapping for realism
  renderer.toneMappingExposure = 1.2; // Slightly brighten the scene
  renderer.setSize(window.innerWidth, window.innerHeight); // Fullscreen HD
  renderer.shadowMap.enabled = true;
  document.getElementById("container").appendChild(renderer.domElement);

  // Add orbit controls for mouse interaction (rotate/zoom/pan)
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Smooth camera movement
  controls.dampingFactor = 0.05;
  controls.minDistance = -1; // Prevent zooming too close
  controls.maxDistance = 2; // Prevent zooming too far

  // Load the 3D model using GLTFLoader
  new THREE.GLTFLoader().load(
    "models/polo_white_tshirt.glb",
    (gltf) => {
      capModel = gltf.scene;
      normalizeModel(capModel); // Scale and center the model

      // Clone materials for each mesh so we can modify them independently
      capModel.traverse(
        (child) => child.isMesh && (child.material = child.material.clone())
      );

      scene.add(capModel);
      activeModel = capModel; // <-- add this line to track active model

      updateAllColors(); // Apply default colors
      document.getElementById("loadOtherModel").textContent = "Check Tshirt Model"; // Add this line
      document.getElementById("loading").style.display = "none";    },
    (xhr) =>
      console.log(((xhr.loaded / xhr.total) * 100).toFixed(2) + "% loaded"), // Progress callback
    (error) => {
      // Error callback
      const el = document.getElementById("loading");
      el.textContent = "Failed to load model. See console.";
      el.style.backgroundColor = "#ff0000";
      console.error("Failed to load model:", error);
    }
  );

  // Set up color picker event listeners for each part
  Object.keys(colors).forEach((k) =>
    document.getElementById(k + "Color").addEventListener("input", (e) => {
      colors[k] = e.target.value; // Update color when picker changes
      !selectedMesh && updateAllColors(); // Update all parts if no specific part is selected
    })
  );

  // Handle window resize (maintain square aspect ratio)
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Add click handler for selecting parts
  renderer.domElement.addEventListener("click", onClick);

  // Start animation loop
  animate();
}

let secondModel = null; // Store reference to the second model

document.getElementById("loadOtherModel").addEventListener("click", () => {
  loadSecondModel();
});
function loadSecondModel() {
  document.getElementById("loading").style.display = "block";

  // If second model is already loaded, switch back to cap model
  if (secondModel && activeModel === secondModel) {
    scene.remove(secondModel);
    scene.add(capModel);
    activeModel = capModel;
    updateAllColors();
    document.getElementById("loadOtherModel").textContent = "Check Tshirt Model"; // Update button text
    document.getElementById("loading").style.display = "none";
    return;
  }

  // Remove the first model if present
  if (capModel) {
    scene.remove(capModel);
  }

  // Remove existing second model if already loaded
  if (secondModel) {
    scene.remove(secondModel);
    secondModel.traverse((child) => {
      if (child.isMesh) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    secondModel = null;
  }

  const loader = new THREE.GLTFLoader();
  loader.load(
    "models/tshirt (1).glb",
    (gltf) => {
      secondModel = gltf.scene;
      normalizeModel(secondModel);
      secondModel.traverse(
        (child) => child.isMesh && (child.material = child.material.clone())
      );
      scene.add(secondModel);
      activeModel = secondModel;
      updateAllColors();
      document.getElementById("loadOtherModel").textContent = "Check SpySport Model"; // Update button text
      document.getElementById("loading").style.display = "none";
    },
    (xhr) =>
      console.log(`Second model ${((xhr.loaded / xhr.total) * 100).toFixed(2)}% loaded`),
    (error) => {
      document.getElementById("loading").textContent = "Failed to load second model.";
      console.error("Error loading second model:", error);
    }
  );
}
/**
 * Normalize model size and position (center and scale to consistent size)
 * @param {THREE.Object3D} model - The 3D model to normalize
 */
function normalizeModel(model) {
  const box = new THREE.Box3().setFromObject(model); // Get bounding box
  const size = box.getSize(new THREE.Vector3()); // Get dimensions
  const scale = 1.5 / Math.max(size.x, size.y, size.z); // Calculate scale to fit
  model.scale.set(scale, scale, scale); // Apply uniform scale

  // Re-center the model after scaling
  box.setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
}

/**
 * Update colors for all parts of the cap based on current color settings
 */
function updateAllColors() {
  if (!activeModel) return;

  activeModel.traverse((child) => {
    if (child.isMesh) {
      for (const part in partNames) {
        if (child.name.includes(partNames[part])) {
          // Only update the color, keep all other material properties
          child.material.color.set(colors[part]);
          
          // If you want to use vertex coloring for the main parts:
          if (part === 'main') {
            const geometry = child.geometry;
            if (geometry.isBufferGeometry && !geometry.attributes.color) {
              geometry.setAttribute(
                "color",
                new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3)
              );
              const colorsArray = geometry.attributes.color.array;
              const baseColor = new THREE.Color(colors[part]);
              for (let i = 0; i < geometry.attributes.position.count; i++) {
                colorsArray[i * 3] = baseColor.r;
                colorsArray[i * 3 + 1] = baseColor.g;
                colorsArray[i * 3 + 2] = baseColor.b;
              }
              geometry.attributes.color.needsUpdate = true;
              child.material.vertexColors = true;
            }
          }
        }
      }
    }
  });
}

/**
 * Animation loop - runs every frame
 */
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Update orbit controls
  renderer.render(scene, camera); // Render the scene
}

/**
 * Handle mouse clicks on the 3D model
 * @param {MouseEvent} event - The click event
 */
function onClick(event) {
  if (!capModel) return; // Exit if model not loaded

  // Convert mouse coordinates to normalized device coordinates (-1 to +1)
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );

  // Cast ray from camera through mouse position
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(activeModel.children, true);

  if (intersects.length) {
    // If we hit something, select it and show color picker
    selectedMesh = intersects[0].object;
    const colorHex = "#" + selectedMesh.material.color.getHexString();
    console.log(`Selected mesh: ${selectedMesh.name}, Color: ${colorHex}`);
    showFloatingColorPicker(event.clientX, event.clientY);
  } else {
    // Clicked empty space - deselect
    selectedMesh = null;
    removeFloatingColorPicker();
  }
}

/**
 * Show a floating color picker at specified screen coordinates
 * @param {number} x - Screen X coordinate
 * @param {number} y - Screen Y coordinate
 */
function showFloatingColorPicker(x, y) {
  removeFloatingColorPicker();

  floatingColorPicker = document.createElement("input");
  floatingColorPicker.type = "color";
  floatingColorPicker.value = "#" + selectedMesh.material.color.getHexString();

  Object.assign(floatingColorPicker.style, {
    position: "fixed",
    left: x + 10 + "px",
    top: y + 10 + "px",
    zIndex: 1000,
  });

  floatingColorPicker.addEventListener("input", (e) => {
    if (!selectedMesh) return;
    const color = e.target.value;
    
    // Instead of replacing material, just update the color
    selectedMesh.material.color.set(color);
    
    // If you want to keep vertex coloring but maintain material properties:
    if (selectedMesh.geometry.isBufferGeometry) {
      const geometry = selectedMesh.geometry;
      if (!geometry.attributes.color) {
        geometry.setAttribute(
          "color",
          new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3)
        );
      }
      
      const colors = geometry.attributes.color.array;
      const baseColor = new THREE.Color(color);
      for (let i = 0; i < geometry.attributes.position.count; i++) {
        colors[i * 3] = baseColor.r;
        colors[i * 3 + 1] = baseColor.g;
        colors[i * 3 + 2] = baseColor.b;
      }
      geometry.attributes.color.needsUpdate = true;
      
      // Enable vertex colors while keeping original material
      selectedMesh.material.vertexColors = true;
    }
  });

  floatingColorPicker.addEventListener("blur", () => {
    removeFloatingColorPicker();
    selectedMesh = null;
  });

  document.body.appendChild(floatingColorPicker);
  floatingColorPicker.focus();
}

/**
 * Remove the floating color picker from DOM
 */
function removeFloatingColorPicker() {
  floatingColorPicker?.remove(); // Safely remove if exists
  floatingColorPicker = null;
}

// Start the application
init();
