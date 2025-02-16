import * as THREE from 'three';


const createScene = (container) => {
  let scene, camera, renderer;
    // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;
  camera.position.y = -5;
  camera.rotation.x = Math.PI;

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Orbit Controls

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // Book cover (base)
  const coverGeometry = new THREE.BoxGeometry(5, 0.2, 4);
  const coverMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
  });
  const cover = new THREE.Mesh(coverGeometry, coverMaterial);
  scene.add(cover);

  // Pages
  const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });
  const pages = [];
  for (let i = 0; i < 10; i++) {
    const pageGeometry = new THREE.PlaneGeometry(2.3, 3.5, 10, 10);
    const pageMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    const page = new THREE.Mesh(pageGeometry, pageMaterial);
    page.position.y = 0.1 + i * 0.02;
    page.rotation.x = Math.PI / 2;
    page.position.x = 0; // Aligned with spine
    page.geometry.translate(-1.15, 0, 0); // Rotate around left edge
    scene.add(page);
    pages.push(page);
  }

  // Animate page turning
  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);
    frame++;

    // Simulate pages flipping from spine with slower speed
    pages.forEach((page, index) => {
      const delay = index * 300; // Increased delay for slower flipping
      const angle = Math.max(0, Math.sin((frame - delay) * 0.01)) * Math.PI;
      page.rotation.y = -angle;

      // Add wave effect for flexibility
      const position = page.geometry.attributes.position;
      for (let i = 0; i < position.count; i++) {
        const y = position.getY(i);
        const offset = Math.sin(frame * 0.01 + y * 2) * 0.1;
        position.setZ(i, offset);
      }
      position.needsUpdate = true;
    });

    renderer.render(scene, camera);
  }

  animate();

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  // Return the scene, camera, and renderer so they can be used in the main component
  return { scene, camera, renderer};
};

export default createScene;
