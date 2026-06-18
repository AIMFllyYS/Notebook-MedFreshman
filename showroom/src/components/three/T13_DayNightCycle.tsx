import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const T13_DayNightCycle: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);
  const sunRef = useRef<THREE.DirectionalLight | null>(null);
  const moonRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiRef = useRef<THREE.HemisphereLight | null>(null);
  const skyMatRef = useRef<THREE.MeshBasicMaterial | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      200
    );
    camera.position.set(0, 8, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Sky dome
    const skyGeometry = new THREE.SphereGeometry(80, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      side: THREE.BackSide,
    });
    skyMatRef.current = skyMaterial;
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x3a7a3a });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Trees (simple cones)
    const treeGroup = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.5, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const leavesGeo = new THREE.ConeGeometry(1.5, 3, 8);
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist = 8 + Math.random() * 8;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(x, 0.75, z);
      trunk.castShadow = true;
      treeGroup.add(trunk);

      const leaves = new THREE.Mesh(leavesGeo, leavesMat);
      leaves.position.set(x, 2.5, z);
      leaves.castShadow = true;
      treeGroup.add(leaves);
    }
    scene.add(treeGroup);

    // House
    const houseGroup = new THREE.Group();
    const houseBodyGeo = new THREE.BoxGeometry(4, 3, 4);
    const houseBodyMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c });
    const houseBody = new THREE.Mesh(houseBodyGeo, houseBodyMat);
    houseBody.position.y = 1.5;
    houseBody.castShadow = true;
    houseBody.receiveShadow = true;
    houseGroup.add(houseBody);

    const roofGeo = new THREE.ConeGeometry(3.5, 2, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b0000 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 4;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    houseGroup.add(roof);
    scene.add(houseGroup);

    // Sun
    const sunGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sunMesh);

    const sunLight = new THREE.DirectionalLight(0xffffee, 1.5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    scene.add(sunLight);
    sunRef.current = sunLight;

    // Moon
    const moonGeometry = new THREE.SphereGeometry(1, 32, 32);
    const moonMaterial = new THREE.MeshBasicMaterial({ color: 0xdddddd });
    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moonMesh);

    const moonLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    moonLight.castShadow = true;
    scene.add(moonLight);
    moonRef.current = moonLight;

    // Hemisphere light for ambient sky/ground color
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x3a7a3a, 0.6);
    scene.add(hemiLight);
    hemiRef.current = hemiLight;

    // Stars (visible at night)
    const starsGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 60;
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    starsGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(starPositions, 3)
    );
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.3,
      transparent: true,
      opacity: 0,
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    const clock = new THREE.Clock();
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const dayDuration = 20; // seconds for full cycle
      const cycle = (elapsed % dayDuration) / dayDuration;
      const angle = cycle * Math.PI * 2;

      const radius = 40;
      const sunX = Math.cos(angle) * radius;
      const sunY = Math.sin(angle) * radius;

      // Sun movement
      sunMesh.position.set(sunX, sunY, -10);
      sunLight.position.set(sunX, sunY, -10);

      // Moon opposite to sun
      moonMesh.position.set(-sunX, -sunY, -10);
      moonLight.position.set(-sunX, -sunY, -10);

      // Sky color interpolation
      const dayColor = new THREE.Color(0x87ceeb);
      const sunsetColor = new THREE.Color(0xff6600);
      const nightColor = new THREE.Color(0x050520);

      let skyColor: THREE.Color;
      let sunIntensity: number;
      let moonIntensity: number;
      let starOpacity: number;

      if (cycle < 0.25) {
        // Night to sunrise
        const t = cycle / 0.25;
        skyColor = nightColor.clone().lerp(sunsetColor, t);
        sunIntensity = t * 0.5;
        moonIntensity = 0.3 * (1 - t);
        starOpacity = 1 - t;
      } else if (cycle < 0.5) {
        // Sunrise to noon
        const t = (cycle - 0.25) / 0.25;
        skyColor = sunsetColor.clone().lerp(dayColor, t);
        sunIntensity = 0.5 + t * 1.0;
        moonIntensity = 0;
        starOpacity = 0;
      } else if (cycle < 0.75) {
        // Noon to sunset
        const t = (cycle - 0.5) / 0.25;
        skyColor = dayColor.clone().lerp(sunsetColor, t);
        sunIntensity = 1.5 - t * 1.0;
        moonIntensity = 0;
        starOpacity = 0;
      } else {
        // Sunset to night
        const t = (cycle - 0.75) / 0.25;
        skyColor = sunsetColor.clone().lerp(nightColor, t);
        sunIntensity = 0.5 * (1 - t);
        moonIntensity = 0.3 * t;
        starOpacity = t;
      }

      skyMaterial.color.copy(skyColor);
      sunLight.intensity = Math.max(0, sunIntensity);
      moonLight.intensity = Math.max(0, moonIntensity);
      starsMaterial.opacity = Math.max(0, starOpacity);

      // Hemisphere light adjusts with time
      hemiLight.color.copy(skyColor);
      hemiLight.groundColor.setHSL(0.3, 0.5, 0.1 + Math.max(0, sunIntensity) * 0.3);
      hemiLight.intensity = 0.2 + Math.max(0, sunIntensity) * 0.4;

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
      skyGeometry.dispose();
      skyMaterial.dispose();
      groundGeometry.dispose();
      groundMaterial.dispose();
      trunkGeo.dispose();
      trunkMat.dispose();
      leavesGeo.dispose();
      leavesMat.dispose();
      houseBodyGeo.dispose();
      houseBodyMat.dispose();
      roofGeo.dispose();
      roofMat.dispose();
      sunGeometry.dispose();
      sunMaterial.dispose();
      moonGeometry.dispose();
      moonMaterial.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
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

// Keep reference for cleanup
const sceneRef = { current: null as THREE.Scene | null };

export default T13_DayNightCycle;
