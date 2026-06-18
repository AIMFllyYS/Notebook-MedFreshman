import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const T4_MultiMaterialDice: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const diceRef = useRef<THREE.Mesh | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xff6600, 30);
    pointLight.position.set(-3, 2, 3);
    scene.add(pointLight);

    // Dice with 6 different materials (one per face)
    const boxGeometry = new THREE.BoxGeometry(2, 2, 2);

    const createFaceTexture = (number: number, color: string): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get 2d context');

      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 256, 256);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 120px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(number), 128, 128);

      // Border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.strokeRect(8, 8, 240, 240);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    const faceColors = ['#c0392b', '#2980b9', '#27ae60', '#f39c12', '#8e44ad', '#16a085'];
    const materials = faceColors.map((color, index) => {
      return new THREE.MeshStandardMaterial({
        map: createFaceTexture(index + 1, color),
        roughness: 0.3,
        metalness: 0.2,
      });
    });

    const dice = new THREE.Mesh(boxGeometry, materials);
    dice.castShadow = true;
    dice.receiveShadow = true;
    diceRef.current = dice;
    scene.add(dice);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.5;
    floor.receiveShadow = true;
    scene.add(floor);

    // Animation loop
    const animate = (): void => {
      rafRef.current = requestAnimationFrame(animate);
      dice.rotation.x += 0.008;
      dice.rotation.y += 0.012;
      dice.rotation.z += 0.004;
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
      boxGeometry.dispose();
      materials.forEach((mat) => {
        if (mat.map) mat.map.dispose();
        mat.dispose();
      });
      floorGeometry.dispose();
      floorMaterial.dispose();
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

export default T4_MultiMaterialDice;
