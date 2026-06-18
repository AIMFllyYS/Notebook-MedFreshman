import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const T37_OrbitViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5, 4, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls with damping and auto-rotate
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.minDistance = 3;
    controls.maxDistance = 20;
    controls.target.set(0, 0.5, 0);

    // Product-like object: stylized headset/viewer
    const productGroup = new THREE.Group();

    // Main body
    const bodyGeo = new THREE.BoxGeometry(2, 1.2, 1);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.2,
      metalness: 0.8,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    productGroup.add(body);

    // Lens circles
    const lensGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 32);
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.05,
      metalness: 0.9,
    });
    const leftLens = new THREE.Mesh(lensGeo, lensMat);
    leftLens.rotation.x = Math.PI / 2;
    leftLens.position.set(-0.5, 0.1, 0.51);
    productGroup.add(leftLens);

    const rightLens = new THREE.Mesh(lensGeo, lensMat);
    rightLens.rotation.x = Math.PI / 2;
    rightLens.position.set(0.5, 0.1, 0.51);
    productGroup.add(rightLens);

    // Band
    const bandGeo = new THREE.TorusGeometry(1.1, 0.15, 16, 64, Math.PI);
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.6,
      metalness: 0.3,
    });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.set(0, 0, -0.3);
    productGroup.add(band);

    // Detail buttons
    const btnGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16);
    const btnMat = new THREE.MeshStandardMaterial({ color: 0xff4444 });
    const btn = new THREE.Mesh(btnGeo, btnMat);
    btn.rotation.x = Math.PI / 2;
    btn.position.set(0.7, 0.3, 0.51);
    productGroup.add(btn);

    productGroup.position.y = 0.6;
    scene.add(productGroup);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xccddff, 0.8);
    fillLight.position.set(-5, 3, -2);
    scene.add(fillLight);
    const rimLight = new THREE.SpotLight(0xffddaa, 2);
    rimLight.position.set(0, 5, -5);
    rimLight.lookAt(0, 0, 0);
    scene.add(rimLight);

    const animate = () => {
      controls.update();
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
      cancelAnimationFrame(rafRef.current);
      controls.dispose();
      renderer.dispose();
      bodyGeo.dispose();
      bodyMat.dispose();
      lensGeo.dispose();
      lensMat.dispose();
      bandGeo.dispose();
      bandMat.dispose();
      btnGeo.dispose();
      btnMat.dispose();
      floorGeo.dispose();
      floorMat.dispose();
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

export default T37_OrbitViewer;
