import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const T31_BloomGlow: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 12);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Post-processing: Bloom
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.5, // strength
      0.4, // radius
      0.1 // threshold
    );
    composer.addPass(bloomPass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);
    composerRef.current = composer;

    // Objects: glowing core + orbiting particles
    const coreGeo = new THREE.SphereGeometry(1.5, 64, 64);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x0088ff,
      emissiveIntensity: 2.0,
      roughness: 0.2,
      metalness: 0.8,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Orbiting small spheres
    const orbitCount = 40;
    const orbitMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < orbitCount; i++) {
      const geo = new THREE.SphereGeometry(0.15, 16, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        emissive: 0xff4400,
        emissiveIntensity: 3.0,
        roughness: 0.1,
        metalness: 0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const angle = (i / orbitCount) * Math.PI * 2;
      const radius = 3 + Math.random() * 2;
      mesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, (Math.random() - 0.5) * 2);
      scene.add(mesh);
      orbitMeshes.push(mesh);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 2, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Animation
    let time = 0;
    const animate = () => {
      time += 0.01;
      core.rotation.y += 0.005;
      core.rotation.x += 0.003;

      orbitMeshes.forEach((mesh, i) => {
        const angle = (i / orbitCount) * Math.PI * 2 + time * (0.5 + (i % 3) * 0.2);
        const r = 3 + Math.sin(time + i) * 0.5;
        mesh.position.x = Math.cos(angle) * r;
        mesh.position.y = Math.sin(angle) * r;
        mesh.position.z = Math.sin(time * 0.5 + i) * 2;
      });

      composer.render();
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Resize
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloomPass.resolution.set(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
      composer.dispose();
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      orbitMeshes.forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
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

export default T31_BloomGlow;
