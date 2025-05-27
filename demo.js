
// let scene, camera, renderer, controls, capModel;
// const raycaster = new THREE.Raycaster();
// const mouse = new THREE.Vector2();
// const partNames = {
//   main: "Main", bill: "Bill", button: "Button", logo: "Logo"
// };
// let colors = {
//   main: "#3366ff", bill: "#000000", button: "#ffffff", logo: "#ff0000"
// };
// let selectedMesh = null, floatingColorPicker = null;

// function init() {
//   document.getElementById("loading").style.display = "block";
  
//   scene = new THREE.Scene();
//   scene.background = new THREE.Color(0xf0f0f0);
//   scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  
//   const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
//   light1.position.set(1, 1, 1);
//   scene.add(light1);
  
//   const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
//   light2.position.set(-1, -1, -1);
//   scene.add(light2);

//   camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
//   camera.position.set(0, 0, 5);

//   renderer = new THREE.WebGLRenderer({ antialias: true });
//   renderer.setSize(200, 200);
//   renderer.shadowMap.enabled = true;
//   document.getElementById("container").appendChild(renderer.domElement);

//   controls = new THREE.OrbitControls(camera, renderer.domElement);
//   controls.enableDamping = true;
//   controls.dampingFactor = 0.05;
//   controls.minDistance = 2;
//   controls.maxDistance = 10;

//   new THREE.GLTFLoader().load("models/gucci_shoes.glb", 
//     gltf => {
//       capModel = gltf.scene;
//       normalizeModel(capModel);
//       capModel.traverse(child => child.isMesh && (child.material = child.material.clone()));
//       scene.add(capModel);
//       updateAllColors();
//       document.getElementById("loading").style.display = "none";
//     },
//     xhr => console.log((xhr.loaded / xhr.total * 100).toFixed(2) + "% loaded"),
//     error => {
//       const el = document.getElementById("loading");
//       el.textContent = "Failed to load model. See console.";
//       el.style.backgroundColor = "#ff0000";
//       console.error("Failed to load model:", error);
//     }
//   );

//   Object.keys(colors).forEach(k => 
//     document.getElementById(k + "Color").addEventListener("input", e => {
//       colors[k] = e.target.value;
//       !selectedMesh && updateAllColors();
//     })
//   );

//   window.addEventListener("resize", () => {
//     camera.aspect = 1;
//     camera.updateProjectionMatrix();
//     renderer.setSize(200, 200);
//   });

//   renderer.domElement.addEventListener("click", onClick);
//   animate();
// }

// function normalizeModel(model) {
//   const box = new THREE.Box3().setFromObject(model);
//   const size = box.getSize(new THREE.Vector3());
//   const scale = 1.5 / Math.max(size.x, size.y, size.z);
//   model.scale.set(scale, scale, scale);
//   box.setFromObject(model);
//   const center = box.getCenter(new THREE.Vector3());
//   model.position.sub(center);
// }

// function updateAllColors() {
//   capModel?.traverse(child => {
//     if (child.isMesh) {
//       for (const [part, name] of Object.entries(partNames)) {
//         child.name.includes(name) && child.material.color.set(colors[part]);
//       }
//     }
//   });
// }

// function animate() {
//   requestAnimationFrame(animate);
//   controls.update();
//   renderer.render(scene, camera);
// }

// function onClick(event) {
//   if (!capModel) return;
  
//   const rect = renderer.domElement.getBoundingClientRect();
//   mouse.set(
//     ((event.clientX - rect.left) / rect.width) * 2 - 1,
//     -((event.clientY - rect.top) / rect.height) * 2 + 1
//   );
  
//   raycaster.setFromCamera(mouse, camera);
//   const intersects = raycaster.intersectObjects(capModel.children, true);
  
//   if (intersects.length) {
//     selectedMesh = intersects[0].object;
//     const colorHex = "#" + selectedMesh.material.color.getHexString();
//     console.log(`Selected mesh: ${selectedMesh.name}, Color: ${colorHex}`);
//     showFloatingColorPicker(event.clientX, event.clientY);
//   } else {
//     selectedMesh = null;
//     removeFloatingColorPicker();
//   }
// }

// function showFloatingColorPicker(x, y) {
//   removeFloatingColorPicker();
  
//   floatingColorPicker = document.createElement("input");
//   floatingColorPicker.type = "color";
//   floatingColorPicker.value = "#" + selectedMesh.material.color.getHexString();
//   Object.assign(floatingColorPicker.style, {
//     position: "fixed", left: x + 10 + "px", 
//     top: y + 10 + "px", zIndex: 1000
//   });
  
//   floatingColorPicker.addEventListener("input", e => {
//     if (!selectedMesh) return;
//     const color = e.target.value;
    
//     if (!selectedMesh.material.vertexColors) {
//       selectedMesh.material.vertexColors = true;
//       selectedMesh.material.needsUpdate = true;
//     }
    
//     const geometry = selectedMesh.geometry;
//     if (geometry.isBufferGeometry) {
//       const position = geometry.attributes.position;
//       if (!geometry.attributes.color) {
//         geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(position.count * 3), 3));
//       }
      
//       const colors = geometry.attributes.color.array;
//       for (let i = 0; i < position.count; i++) {
//         const baseColor = new THREE.Color(color);
//         baseColor.offsetHSL(0, 0, (i / position.count) * 0.2);
//         colors.set([baseColor.r, baseColor.g, baseColor.b], i * 3);
//       }
//       geometry.attributes.color.needsUpdate = true;
//     }
    
//     console.log(`Changed color of ${selectedMesh.name} to ${color}`);
//   });
  
//   floatingColorPicker.addEventListener("blur", () => {
//     removeFloatingColorPicker();
//     selectedMesh = null;
//   });
  
//   document.body.appendChild(floatingColorPicker);
//   floatingColorPicker.focus();
// }

// function removeFloatingColorPicker() {
//   floatingColorPicker?.remove();
//   floatingColorPicker = null;
// }

// init();