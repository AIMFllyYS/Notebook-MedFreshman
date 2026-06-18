import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const T9_VertexColorTerrain: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const terrainRef = useRef<THREE.Mesh | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 200);
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Terrain geometry
    const segments = 128;
    const geometry = new THREE.PlaneGeometry(30, 30, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const positionAttribute = geometry.getAttribute('position');
    const colors: number[] = [];

    const colorDeepWater = new THREE.Color(0x1a4d6e);
    const colorShallowWater = new THREE.Color(0x2e8b9a);
    const colorSand = new THREE.Color(0xe6c288);
    const colorGrass = new THREE.Color(0x4a8c3f);
    const colorForest = new THREE.Color(0x2d5a27);
    const colorRock = new THREE.Color(0x808080);
    const colorSnow = new THREE.Color(0xffffff);

    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const z = positionAttribute.getZ(i);

      // Multi-octave noise-like height
      const h1 = Math.sin(x * 0.2) * Math.cos(z * 0.2) * 2;
      const h2 = Math.sin(x * 0.5 + 1.0) * Math.cos(z * 0.5 + 0.5) * 1;
      const h3 = Math.sin(x * 1.2 + 2.0) * Math.cos(z * 0.8 + 1.5) * 0.3;
      const h4 = Math.sin(x * 2.5) * Math.sin(z * 2.5) * 0.1;
      const y = h1 + h2 + h3 + h4;

      positionAttribute.setY(i, y);

      // Vertex color based on height
      let color = new THREE.Color();
      if (y < -0.5) {
        color.copy(colorDeepWater).lerp(colorShallowWater, (y + 2) / 1.5);
      } else if (y < 0.2) {
        color.copy(colorShallowWater).lerp(colorSand, (y + 0.5) / 0.7);
      } else if (y < 1.5) {
        color.copy(colorSand).lerp(colorGrass, (y - 0.2) / 1.3);
      } else if (y < 2.8) {
        color.copy(colorGrass).lerp(colorForest, (y - 1.5) / 1.3);
      } else if (y < 3.5) {
        color.copy(colorForest).lerp(colorRock, (y - 2.8) / 0.7);
      } else {
        color.copy(colorRock).lerp(colorSnow, (y - 3.5) / 1.0);
      }

      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.8,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrainRef.current = terrain;
    scene.add(terrain);

    // Water plane
    const waterGeo = new THREE.PlaneGeometry(30, 30);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x1a4d6e,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1,
      metalness: 0.3,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = -0.3;
    scene.add(water);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = (): void => {
      rafRef.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      camera.position.x = Math.sin(time * 0.1) * 12;
      camera.position.z = Math.cos(time * 0.1) * 12;
      camera.lookAt(0, 1, 0);

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
      geometry.dispose();
      material.dispose();
      waterGeo.dispose();
      waterMat.dispose();
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

export default T9_VertexColorTerrain;
