import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

function createMatCapTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2d context');

  // Create a metallic matcap gradient
  const gradient = ctx.createRadialGradient(256, 100, 20, 256, 256, 300);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.2, '#e0e0e0');
  gradient.addColorStop(0.4, '#a0a0a0');
  gradient.addColorStop(0.6, '#606060');
  gradient.addColorStop(0.8, '#303030');
  gradient.addColorStop(1, '#101010');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  // Add highlight spot
  const highlight = ctx.createRadialGradient(180, 120, 10, 180, 120, 80);
  highlight.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = highlight;
  ctx.fillRect(0, 0, 512, 512);

  // Secondary warm highlight
  const warm = ctx.createRadialGradient(350, 150, 10, 350, 150, 60);
  warm.addColorStop(0, 'rgba(255, 220, 180, 0.4)');
  warm.addColorStop(1, 'rgba(255, 220, 180, 0)');
  ctx.fillStyle = warm;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const T10_MatCapSculpture: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sculptureRef = useRef<THREE.Group | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1, 6);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // MatCap texture
    const matcapTexture = createMatCapTexture();

    // Sculpture group (abstract head-like form)
    const sculpture = new THREE.Group();
    sculptureRef.current = sculpture;
    scene.add(sculpture);

    // Head sphere
    const headGeo = new THREE.SphereGeometry(1.2, 64, 64);
    const matcapMaterial = new THREE.MeshMatcapMaterial({
      matcap: matcapTexture,
    });
    const head = new THREE.Mesh(headGeo, matcapMaterial);
    head.position.y = 0.5;
    sculpture.add(head);

    // Face details - nose
    const noseGeo = new THREE.ConeGeometry(0.15, 0.6, 32);
    const nose = new THREE.Mesh(noseGeo, matcapMaterial);
    nose.position.set(0, 0.4, 1.1);
    nose.rotation.x = -0.2;
    sculpture.add(nose);

    // Eyes (indentations using smaller spheres)
    const eyeGeo = new THREE.SphereGeometry(0.18, 32, 32);
    const eyeMat = new THREE.MeshMatcapMaterial({
      matcap: matcapTexture,
      color: 0x333333,
    });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.4, 0.7, 1.05);
    leftEye.scale.z = 0.5;
    sculpture.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.4, 0.7, 1.05);
    rightEye.scale.z = 0.5;
    sculpture.add(rightEye);

    // Brow ridge
    const browGeo = new THREE.TorusGeometry(0.5, 0.08, 16, 32, Math.PI);
    const brow = new THREE.Mesh(browGeo, matcapMaterial);
    brow.position.set(0, 0.95, 0.95);
    brow.rotation.x = 0.3;
    sculpture.add(brow);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.5, 0.7, 1, 32);
    const neck = new THREE.Mesh(neckGeo, matcapMaterial);
    neck.position.y = -0.8;
    sculpture.add(neck);

    // Shoulders / base
    const shoulderGeo = new THREE.TorusGeometry(1.5, 0.4, 32, 64);
    const shoulder = new THREE.Mesh(shoulderGeo, matcapMaterial);
    shoulder.position.y = -1.3;
    shoulder.rotation.x = Math.PI / 2;
    sculpture.add(shoulder);

    // Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(2, 2.2, 0.5, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.3,
      metalness: 0.8,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.8;
    scene.add(pedestal);

    // Decorative rings
    const ringGeo = new THREE.TorusGeometry(1.8, 0.05, 16, 100);
    const ringMat = new THREE.MeshMatcapMaterial({
      matcap: matcapTexture,
      color: 0xffd700,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.position.y = 0;
    ring1.rotation.x = Math.PI / 2;
    sculpture.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.position.y = 0.3;
    ring2.rotation.x = Math.PI / 2.2;
    ring2.scale.setScalar(1.1);
    sculpture.add(ring2);

    // Animation loop
    const animate = (): void => {
      rafRef.current = requestAnimationFrame(animate);
      sculpture.rotation.y += 0.005;
      ring1.rotation.z += 0.01;
      ring2.rotation.z -= 0.008;
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
      headGeo.dispose();
      noseGeo.dispose();
      eyeGeo.dispose();
      browGeo.dispose();
      neckGeo.dispose();
      shoulderGeo.dispose();
      pedestalGeo.dispose();
      ringGeo.dispose();
      matcapMaterial.dispose();
      eyeMat.dispose();
      pedestalMat.dispose();
      ringMat.dispose();
      matcapTexture.dispose();
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

export default T10_MatCapSculpture;
