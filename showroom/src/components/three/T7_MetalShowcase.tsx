import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const T7_MetalShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080808);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Environment map (procedural cube render target)
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
    const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
    scene.add(cubeCamera);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight1 = new THREE.PointLight(0xffaa00, 50, 20);
    pointLight1.position.set(-4, 4, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00aaff, 50, 20);
    pointLight2.position.set(4, 2, -2);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xff0044, 30, 20);
    pointLight3.position.set(0, -2, 4);
    scene.add(pointLight3);

    // Group
    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    // Showcase platform
    const platformGeo = new THREE.CylinderGeometry(3, 3.2, 0.3, 64);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.2,
      metalness: 0.9,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -1.5;
    platform.receiveShadow = true;
    group.add(platform);

    // Metal objects
    const metalConfigs = [
      { geo: new THREE.SphereGeometry(1, 64, 64), pos: [0, 0.5, 0] as [number, number, number], color: 0xffd700, metal: 1.0, rough: 0.15 },
      { geo: new THREE.TorusGeometry(1.3, 0.3, 32, 64), pos: [0, 0.5, 0] as [number, number, number], color: 0xc0c0c0, metal: 1.0, rough: 0.1 },
      { geo: new THREE.IcosahedronGeometry(0.6, 0), pos: [2, 0.2, 1] as [number, number, number], color: 0xb87333, metal: 1.0, rough: 0.25 },
      { geo: new THREE.BoxGeometry(0.8, 0.8, 0.8), pos: [-2, 0.2, -1] as [number, number, number], color: 0xaaaaaa, metal: 0.9, rough: 0.2 },
      { geo: new THREE.ConeGeometry(0.5, 1.2, 32), pos: [-1.5, 0.1, 1.5] as [number, number, number], color: 0xeeeeee, metal: 1.0, rough: 0.05 },
      { geo: new THREE.CylinderGeometry(0.4, 0.4, 1, 32), pos: [1.8, 0.1, -1.2] as [number, number, number], color: 0x888888, metal: 0.95, rough: 0.15 },
    ];

    const metalMeshes: THREE.Mesh[] = [];
    metalConfigs.forEach((config) => {
      const mat = new THREE.MeshStandardMaterial({
        color: config.color,
        metalness: config.metal,
        roughness: config.rough,
        envMapIntensity: 1.0,
      });
      const mesh = new THREE.Mesh(config.geo, mat);
      mesh.position.set(...config.pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      metalMeshes.push(mesh);
    });

    // Update cube camera once for reflections
    metalMeshes.forEach((mesh) => {
      mesh.visible = false;
    });
    cubeCamera.update(renderer, scene);
    metalMeshes.forEach((mesh) => {
      mesh.visible = true;
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.envMap = cubeRenderTarget.texture;
      }
    });

    // Animation loop
    const animate = (): void => {
      rafRef.current = requestAnimationFrame(animate);

      metalMeshes.forEach((mesh, index) => {
        mesh.rotation.y += 0.005 * (index + 1) * 0.5;
        mesh.rotation.x += 0.002 * (index % 2 === 0 ? 1 : -1);
      });

      group.rotation.y += 0.003;

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = (): void => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafRef.current);
      metalConfigs.forEach((config) => config.geo.dispose());
      metalMeshes.forEach((mesh) => {
        if (mesh.material instanceof THREE.Material) mesh.material.dispose();
      });
      platformGeo.dispose();
      platformMat.dispose();
      cubeRenderTarget.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
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

export default T7_MetalShowcase;
