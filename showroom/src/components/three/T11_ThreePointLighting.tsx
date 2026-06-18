import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const T11_ThreePointLighting: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameIdRef = useRef<number>(0);
  const lightsRef = useRef<{
    keyLight: THREE.DirectionalLight;
    fillLight: THREE.PointLight;
    rimLight: THREE.SpotLight;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Product (torus knot)
    const productGeometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 32);
    const productMaterial = new THREE.MeshStandardMaterial({
      color: 0xcd7f32,
      roughness: 0.3,
      metalness: 0.8,
    });
    const product = new THREE.Mesh(productGeometry, productMaterial);
    product.castShadow = true;
    product.receiveShadow = true;
    scene.add(product);

    // Pedestal
    const pedestalGeometry = new THREE.CylinderGeometry(1.5, 1.8, 0.5, 64);
    const pedestalMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.5,
      metalness: 0.5,
    });
    const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
    pedestal.position.y = -0.75;
    pedestal.receiveShadow = true;
    pedestal.castShadow = true;
    scene.add(pedestal);

    // Three-point lighting setup
    // 1. Key Light (main illumination)
    const keyLight = new THREE.DirectionalLight(0xfff0dd, 2.0);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.bias = -0.001;
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    scene.add(keyLight);

    // Key light helper visualization
    const keyLightHelper = new THREE.CameraHelper(keyLight.shadow.camera);
    keyLightHelper.visible = false;
    scene.add(keyLightHelper);

    // 2. Fill Light (softens shadows)
    const fillLight = new THREE.PointLight(0xadd8e6, 0.8, 20);
    fillLight.position.set(-5, 4, 3);
    scene.add(fillLight);

    // 3. Rim/Back Light (separates subject from background)
    const rimLight = new THREE.SpotLight(0xffffff, 1.5);
    rimLight.position.set(0, 6, -6);
    rimLight.target = product;
    rimLight.angle = Math.PI / 6;
    rimLight.penumbra = 0.5;
    rimLight.castShadow = true;
    rimLight.shadow.mapSize.width = 1024;
    rimLight.shadow.mapSize.height = 1024;
    scene.add(rimLight);

    lightsRef.current = { keyLight, fillLight, rimLight };

    // Ambient for base visibility
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    // Animation
    const clock = new THREE.Clock();
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Slowly rotate product
      product.rotation.y = elapsed * 0.3;
      product.rotation.x = Math.sin(elapsed * 0.2) * 0.1;

      // Subtle light movement for dynamic feel
      keyLight.position.x = 5 + Math.sin(elapsed * 0.5) * 1;
      keyLight.position.z = 5 + Math.cos(elapsed * 0.5) * 1;

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      renderer.dispose();
      productGeometry.dispose();
      productMaterial.dispose();
      groundGeometry.dispose();
      groundMaterial.dispose();
      pedestalGeometry.dispose();
      pedestalMaterial.dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', overflow: 'hidden' }}
    />
  );
};

export default T11_ThreePointLighting;
