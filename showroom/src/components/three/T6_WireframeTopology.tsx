import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const T6_WireframeTopology: React.FC = () => {
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
    scene.background = new THREE.Color(0x050508);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    // Create multiple wireframe topologies
    const createWireframeObject = (
      geometry: THREE.BufferGeometry,
      color: number,
      position: [number, number, number],
      scale: number
    ): THREE.LineSegments => {
      const edges = new THREE.EdgesGeometry(geometry, 15);
      const lineMaterial = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.8,
      });
      const lines = new THREE.LineSegments(edges, lineMaterial);
      lines.position.set(...position);
      lines.scale.setScalar(scale);
      return lines;
    };

    // Icosahedron wireframe
    const icoGeo = new THREE.IcosahedronGeometry(2, 1);
    const icoWire = createWireframeObject(icoGeo, 0x00ffff, [-4, 2, 0], 1);
    group.add(icoWire);

    // TorusKnot wireframe
    const knotGeo = new THREE.TorusKnotGeometry(1.5, 0.4, 100, 16);
    const knotWire = createWireframeObject(knotGeo, 0xff00ff, [4, 2, 0], 1);
    group.add(knotWire);

    // Octahedron wireframe
    const octaGeo = new THREE.OctahedronGeometry(2, 1);
    const octaWire = createWireframeObject(octaGeo, 0xffff00, [-4, -3, 0], 1);
    group.add(octaWire);

    // Dodecahedron wireframe
    const dodecaGeo = new THREE.DodecahedronGeometry(2, 0);
    const dodecaWire = createWireframeObject(dodecaGeo, 0x00ff00, [4, -3, 0], 1);
    group.add(dodecaWire);

    // Central complex topology - Torus
    const torusGeo = new THREE.TorusGeometry(2, 0.6, 16, 50);
    const torusWire = createWireframeObject(torusGeo, 0xff4444, [0, 0, 0], 1.2);
    group.add(torusWire);

    // Secondary inner wireframe
    const innerGeo = new THREE.IcosahedronGeometry(1, 2);
    const innerWire = createWireframeObject(innerGeo, 0xffffff, [0, 0, 0], 0.8);
    innerWire.material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
    });
    group.add(innerWire);

    // Animation loop
    const animate = (): void => {
      rafRef.current = requestAnimationFrame(animate);

      icoWire.rotation.x += 0.005;
      icoWire.rotation.y += 0.01;

      knotWire.rotation.x += 0.008;
      knotWire.rotation.y += 0.006;

      octaWire.rotation.x += 0.01;
      octaWire.rotation.z += 0.005;

      dodecaWire.rotation.y += 0.007;
      dodecaWire.rotation.x += 0.003;

      torusWire.rotation.x += 0.004;
      torusWire.rotation.y += 0.008;

      innerWire.rotation.x -= 0.006;
      innerWire.rotation.y -= 0.01;

      group.rotation.y += 0.001;

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
      icoGeo.dispose();
      knotGeo.dispose();
      octaGeo.dispose();
      dodecaGeo.dispose();
      torusGeo.dispose();
      innerGeo.dispose();
      group.children.forEach((child) => {
        const line = child as THREE.LineSegments;
        if (line.geometry) line.geometry.dispose();
        if (line.material instanceof THREE.Material) line.material.dispose();
      });
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

export default T6_WireframeTopology;
