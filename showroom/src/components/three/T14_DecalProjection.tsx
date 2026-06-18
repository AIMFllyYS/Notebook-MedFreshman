import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const T14_DecalProjection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 3, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Create a canvas texture for the decal
    const createDecalTexture = (text: string, color: string): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // Transparent background
      ctx.clearRect(0, 0, 512, 512);

      // Draw circle border
      ctx.beginPath();
      ctx.arc(256, 256, 240, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 20;
      ctx.stroke();

      // Draw text
      ctx.fillStyle = color;
      ctx.font = 'bold 120px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 256, 256);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    // Target mesh (a rounded box-like shape)
    const targetGeometry = new THREE.BoxGeometry(3, 3, 3, 32, 32, 32);
    // Smooth normals for better decal projection
    targetGeometry.computeVertexNormals();
    const targetMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.4,
      metalness: 0.6,
    });
    const targetMesh = new THREE.Mesh(targetGeometry, targetMaterial);
    targetMesh.castShadow = true;
    targetMesh.receiveShadow = true;
    scene.add(targetMesh);

    // Create decal geometry by projecting a plane onto the mesh surface
    const createDecal = (
      position: THREE.Vector3,
      orientation: THREE.Euler,
      size: THREE.Vector3,
      texture: THREE.CanvasTexture
    ): THREE.Mesh => {
      const decalGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
      decalGeometry.computeVertexNormals();

      const decalMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        roughness: 0.8,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });

      const decal = new THREE.Mesh(decalGeometry, decalMaterial);
      decal.position.copy(position);
      decal.rotation.copy(orientation);
      decal.scale.copy(size);

      return decal;
    };

    // Decal 1 - Front face
    const decalTexture1 = createDecalTexture('A', '#ff4444');
    const decal1 = createDecal(
      new THREE.Vector3(0, 0, 1.51),
      new THREE.Euler(0, 0, 0),
      new THREE.Vector3(1.5, 1.5, 1.5),
      decalTexture1
    );
    scene.add(decal1);

    // Decal 2 - Right face
    const decalTexture2 = createDecalTexture('B', '#44ff44');
    const decal2 = createDecal(
      new THREE.Vector3(1.51, 0.3, 0),
      new THREE.Euler(0, Math.PI / 2, 0),
      new THREE.Vector3(1.2, 1.2, 1.2),
      decalTexture2
    );
    scene.add(decal2);

    // Decal 3 - Top face
    const decalTexture3 = createDecalTexture('C', '#4444ff');
    const decal3 = createDecal(
      new THREE.Vector3(-0.2, 1.51, 0.2),
      new THREE.Euler(-Math.PI / 2, 0, 0),
      new THREE.Vector3(1.0, 1.0, 1.0),
      decalTexture3
    );
    scene.add(decal3);

    // Decal 4 - Back face (bullet hole style)
    const bulletCanvas = document.createElement('canvas');
    bulletCanvas.width = 256;
    bulletCanvas.height = 256;
    const bCtx = bulletCanvas.getContext('2d')!;
    bCtx.clearRect(0, 0, 256, 256);
    // Cracks
    bCtx.strokeStyle = '#111111';
    bCtx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      bCtx.beginPath();
      bCtx.moveTo(128, 128);
      bCtx.lineTo(128 + Math.cos(angle) * 100, 128 + Math.sin(angle) * 100);
      bCtx.stroke();
    }
    // Hole
    bCtx.beginPath();
    bCtx.arc(128, 128, 30, 0, Math.PI * 2);
    bCtx.fillStyle = '#000000';
    bCtx.fill();
    const bulletTexture = new THREE.CanvasTexture(bulletCanvas);

    const decal4 = createDecal(
      new THREE.Vector3(0, -0.2, -1.51),
      new THREE.Euler(0, Math.PI, 0),
      new THREE.Vector3(0.8, 0.8, 0.8),
      bulletTexture
    );
    scene.add(decal4);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xffaa00, 0.5, 10);
    pointLight.position.set(-3, 2, 3);
    scene.add(pointLight);

    const clock = new THREE.Clock();
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Rotate target mesh slowly
      targetMesh.rotation.y = elapsed * 0.2;
      targetMesh.rotation.x = Math.sin(elapsed * 0.3) * 0.1;

      // Decals need to rotate with the mesh to stay attached visually
      // Since decals are separate meshes, we rotate them around the center
      const rotY = elapsed * 0.2;
      const rotX = Math.sin(elapsed * 0.3) * 0.1;

      // Update decal positions based on mesh rotation
      // Front
      const frontPos = new THREE.Vector3(0, 0, 1.51);
      frontPos.applyEuler(new THREE.Euler(rotX, rotY, 0));
      decal1.position.copy(frontPos);
      decal1.rotation.set(rotX, rotY, 0);

      // Right
      const rightPos = new THREE.Vector3(1.51, 0.3, 0);
      rightPos.applyEuler(new THREE.Euler(rotX, rotY, 0));
      decal2.position.copy(rightPos);
      decal2.rotation.set(rotX, rotY + Math.PI / 2, 0);

      // Top
      const topPos = new THREE.Vector3(-0.2, 1.51, 0.2);
      topPos.applyEuler(new THREE.Euler(rotX, rotY, 0));
      decal3.position.copy(topPos);
      decal3.rotation.set(rotX - Math.PI / 2, rotY, 0);

      // Back
      const backPos = new THREE.Vector3(0, -0.2, -1.51);
      backPos.applyEuler(new THREE.Euler(rotX, rotY, 0));
      decal4.position.copy(backPos);
      decal4.rotation.set(rotX, rotY + Math.PI, 0);

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
      targetGeometry.dispose();
      targetMaterial.dispose();
      decal1.geometry.dispose();
      (decal1.material as THREE.MeshStandardMaterial).dispose();
      decal2.geometry.dispose();
      (decal2.material as THREE.MeshStandardMaterial).dispose();
      decal3.geometry.dispose();
      (decal3.material as THREE.MeshStandardMaterial).dispose();
      decal4.geometry.dispose();
      (decal4.material as THREE.MeshStandardMaterial).dispose();
      groundGeometry.dispose();
      groundMaterial.dispose();
      decalTexture1.dispose();
      decalTexture2.dispose();
      decalTexture3.dispose();
      bulletTexture.dispose();
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

export default T14_DecalProjection;
