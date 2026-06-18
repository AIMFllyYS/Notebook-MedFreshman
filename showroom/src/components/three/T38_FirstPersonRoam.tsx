import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

const T38_FirstPersonRoam: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 0, 60);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.y = 1.7;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // PointerLockControls
    const controls = new PointerLockControls(camera, renderer.domElement);

    // Click to lock
    const lockHandler = () => {
      controls.lock();
    };
    container.addEventListener('click', lockHandler);

    // Movement state
    const keys = { w: false, a: false, s: false, d: false };
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') keys.w = true;
      if (key === 'a' || key === 'arrowleft') keys.a = true;
      if (key === 's' || key === 'arrowdown') keys.s = true;
      if (key === 'd' || key === 'arrowright') keys.d = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') keys.w = false;
      if (key === 'a' || key === 'arrowleft') keys.a = false;
      if (key === 's' || key === 'arrowdown') keys.s = false;
      if (key === 'd' || key === 'arrowright') keys.d = false;
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Scene: simple world
    // Ground
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x3a7a3a });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Random blocks/buildings
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const colors = [0x8b4513, 0xa0522d, 0xcd853f, 0xd2691e, 0x808080];
    const obstacles: THREE.Mesh[] = [];
    for (let i = 0; i < 40; i++) {
      const h = 2 + Math.random() * 6;
      const mat = new THREE.MeshStandardMaterial({ color: colors[i % colors.length] });
      const mesh = new THREE.Mesh(boxGeo, mat);
      mesh.scale.set(2 + Math.random() * 2, h, 2 + Math.random() * 2);
      mesh.position.set(
        (Math.random() - 0.5) * 80,
        h / 2,
        (Math.random() - 0.5) * 80
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      obstacles.push(mesh);
    }

    // Trees
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
    const leavesGeo = new THREE.ConeGeometry(1.2, 2.5, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    for (let i = 0; i < 20; i++) {
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      const leaves = new THREE.Mesh(leavesGeo, leavesMat);
      const x = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      trunk.position.set(x, 0.75, z);
      leaves.position.set(x, 2.5, z);
      scene.add(trunk);
      scene.add(leaves);
      obstacles.push(trunk, leaves);
    }

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = true;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    scene.add(dirLight);

    // Movement
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    const speed = 8.0;

    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();

      if (controls.isLocked) {
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(keys.w) - Number(keys.s);
        direction.x = Number(keys.d) - Number(keys.a);
        direction.normalize();

        if (keys.w || keys.s) velocity.z -= direction.z * speed * 10.0 * delta;
        if (keys.a || keys.d) velocity.x -= direction.x * speed * 10.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
      }

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      container.removeEventListener('click', lockHandler);
      cancelAnimationFrame(rafRef.current);
      controls.dispose();
      renderer.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      boxGeo.dispose();
      trunkGeo.dispose();
      trunkMat.dispose();
      leavesGeo.dispose();
      leavesMat.dispose();
      obstacles.forEach((m) => {
        if (m.geometry) m.geometry.dispose();
        if (m.material) {
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material.dispose();
        }
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', overflow: 'hidden', cursor: 'pointer' }}
      title="点击画面锁定鼠标，使用WASD移动"
    />
  );
};

export default T38_FirstPersonRoam;
