import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const T19_SnowParticles: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1a2a);
    scene.fog = new THREE.FogExp2(0x0a1a2a, 0.02);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Ground (snow covered)
    const groundGeometry = new THREE.PlaneGeometry(60, 60, 64, 64);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 1.0,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Trees
    const treeGroup = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
    const leavesGeo = new THREE.ConeGeometry(1.2, 3, 8);
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x1a3a1a });

    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 5 + Math.random() * 15;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(x, -1.25, z);
      treeGroup.add(trunk);

      const leaves = new THREE.Mesh(leavesGeo, leavesMat);
      leaves.position.set(x, 0.5, z);
      treeGroup.add(leaves);

      // Snow on tree
      const snowCap = new THREE.Mesh(
        new THREE.ConeGeometry(1.0, 0.8, 8),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      snowCap.position.set(x, 1.6, z);
      treeGroup.add(snowCap);
    }
    scene.add(treeGroup);

    // Snow particles
    const snowCount = 8000;
    const snowGeometry = new THREE.BufferGeometry();
    const snowPositions = new Float32Array(snowCount * 3);
    const snowVelocities = new Float32Array(snowCount * 3);
    const snowSizes = new Float32Array(snowCount);

    for (let i = 0; i < snowCount; i++) {
      snowPositions[i * 3] = (Math.random() - 0.5) * 40;
      snowPositions[i * 3 + 1] = Math.random() * 20 - 2;
      snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      // Falling velocity with slight drift
      snowVelocities[i * 3] = (Math.random() - 0.5) * 0.02;
      snowVelocities[i * 3 + 1] = -(0.02 + Math.random() * 0.04);
      snowVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      snowSizes[i] = 0.05 + Math.random() * 0.1;
    }

    snowGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(snowPositions, 3)
    );
    snowGeometry.setAttribute(
      'size',
      new THREE.BufferAttribute(snowSizes, 1)
    );

    // Create a soft circular texture for snowflakes
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    const snowTexture = new THREE.CanvasTexture(canvas);

    const snowMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      map: snowTexture,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const snowSystem = new THREE.Points(snowGeometry, snowMaterial);
    scene.add(snowSystem);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x445566, 0.6);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0xaaccff, 0.8);
    moonLight.position.set(5, 10, 5);
    moonLight.castShadow = true;
    scene.add(moonLight);

    // Warm window light from a cabin
    const cabinLight = new THREE.PointLight(0xffaa55, 1, 10);
    cabinLight.position.set(-3, 0, -3);
    scene.add(cabinLight);

    const clock = new THREE.Clock();
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      const positions = snowGeometry.attributes.position.array as Float32Array;

      for (let i = 0; i < snowCount; i++) {
        // Update position
        positions[i * 3] +=
          snowVelocities[i * 3] + Math.sin(elapsed + i * 0.1) * 0.005;
        positions[i * 3 + 1] += snowVelocities[i * 3 + 1];
        positions[i * 3 + 2] +=
          snowVelocities[i * 3 + 2] + Math.cos(elapsed + i * 0.1) * 0.005;

        // Reset if below ground
        if (positions[i * 3 + 1] < -2) {
          positions[i * 3] = (Math.random() - 0.5) * 40;
          positions[i * 3 + 1] = 10 + Math.random() * 10;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
        }
      }
      snowGeometry.attributes.position.needsUpdate = true;

      // Gentle camera movement
      camera.position.x = Math.sin(elapsed * 0.1) * 2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

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
      groundGeometry.dispose();
      groundMaterial.dispose();
      trunkGeo.dispose();
      trunkMat.dispose();
      leavesGeo.dispose();
      leavesMat.dispose();
      snowGeometry.dispose();
      snowMaterial.dispose();
      snowTexture.dispose();
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

export default T19_SnowParticles;
