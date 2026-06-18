import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface Building {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  color: THREE.Color;
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function generateBuildings(cx: number, cz: number, size: number): Building[] {
  const buildings: Building[] = [];
  const gridSize = 4;
  const cellSize = size / gridSize;

  for (let x = 0; x < gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      const seed = (cx + x) * 73856093 + (cz + z) * 19349663;
      const rand = pseudoRandom(seed);

      if (rand > 0.2) {
        const bx = cx + x * cellSize + cellSize * 0.5 + (pseudoRandom(seed + 1) - 0.5) * cellSize * 0.4;
        const bz = cz + z * cellSize + cellSize * 0.5 + (pseudoRandom(seed + 2) - 0.5) * cellSize * 0.4;
        const width = cellSize * 0.3 + pseudoRandom(seed + 3) * cellSize * 0.3;
        const depth = cellSize * 0.3 + pseudoRandom(seed + 4) * cellSize * 0.3;
        const height = 2 + pseudoRandom(seed + 5) * 12 * (0.5 + pseudoRandom(seed + 6));

        const hue = 0.55 + pseudoRandom(seed + 7) * 0.15;
        const saturation = 0.1 + pseudoRandom(seed + 8) * 0.2;
        const lightness = 0.3 + pseudoRandom(seed + 9) * 0.3;
        const color = new THREE.Color().setHSL(hue, saturation, lightness);

        buildings.push({ x: bx, z: bz, width, depth, height, color });
      }
    }
  }

  return buildings;
}

function createCityChunk(cx: number, cz: number, size: number): THREE.InstancedMesh {
  const buildings = generateBuildings(cx, cz, size);
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  geometry.translate(0, 0.5, 0);
  const material = new THREE.MeshStandardMaterial({
    roughness: 0.7,
    metalness: 0.2,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, buildings.length);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const dummy = new THREE.Object3D();
  for (let i = 0; i < buildings.length; i++) {
    const b = buildings[i];
    dummy.position.set(b.x, 0, b.z);
    dummy.scale.set(b.width, b.height, b.depth);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.setColorAt(i, b.color);
  }

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  return mesh;
}

export default function T49_ProceduralCity() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rafRef = useRef<number>(0);
  const chunksRef = useRef<Map<string, THREE.InstancedMesh>>(new Map());
  const timeRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.Fog(0x0a0a1a, 30, 90);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      200
    );
    camera.position.set(0, 15, 30);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0x1a1a3e, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x6688cc, 0.8);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.camera.left = -40;
    dirLight.shadow.camera.right = 40;
    dirLight.shadow.camera.top = 40;
    dirLight.shadow.camera.bottom = -40;
    scene.add(dirLight);

    // Street lights
    const streetLightGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const streetLightMat = new THREE.MeshBasicMaterial({ color: 0xffaa44 });
    const streetLights = new THREE.InstancedMesh(streetLightGeo, streetLightMat, 100);
    const dummy = new THREE.Object3D();
    let lightIdx = 0;
    for (let x = -4; x <= 4; x++) {
      for (let z = -4; z <= 4; z++) {
        if (lightIdx >= 100) break;
        dummy.position.set(x * 10, 0.5, z * 10);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        streetLights.setMatrixAt(lightIdx, dummy.matrix);
        lightIdx++;
      }
    }
    scene.add(streetLights);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Roads
    const roadGeo = new THREE.PlaneGeometry(200, 2);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3e, roughness: 0.9 });
    for (let i = -10; i <= 10; i++) {
      const roadX = new THREE.Mesh(roadGeo, roadMat);
      roadX.rotation.x = -Math.PI / 2;
      roadX.position.set(0, 0.01, i * 10);
      scene.add(roadX);

      const roadZ = new THREE.Mesh(roadGeo.clone(), roadMat);
      roadZ.rotation.x = -Math.PI / 2;
      roadZ.rotation.z = Math.PI / 2;
      roadZ.position.set(i * 10, 0.01, 0);
      scene.add(roadZ);
    }

    const chunkSize = 20;
    const chunkCount = 3;
    const chunks = chunksRef.current;

    function updateChunks() {
      const camX = camera.position.x;
      const camZ = camera.position.z;

      const neededChunks = new Set<string>();
      for (let x = -chunkCount; x <= chunkCount; x++) {
        for (let z = -chunkCount; z <= chunkCount; z++) {
          const cx = Math.floor((camX + x * chunkSize) / chunkSize) * chunkSize;
          const cz = Math.floor((camZ + z * chunkSize) / chunkSize) * chunkSize;
          const key = `${cx},${cz}`;
          neededChunks.add(key);

          if (!chunks.has(key)) {
            const chunk = createCityChunk(cx, cz, chunkSize);
            scene.add(chunk);
            chunks.set(key, chunk);
          }
        }
      }

      for (const [key, chunk] of chunks.entries()) {
        if (!neededChunks.has(key)) {
          scene.remove(chunk);
          chunk.geometry.dispose();
          (chunk.material as THREE.Material).dispose();
          chunks.delete(key);
        }
      }
    }

    updateChunks();

    function animate() {
      rafRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;
      const t = timeRef.current;

      // Flyover
      camera.position.x = Math.sin(t * 0.08) * 50;
      camera.position.z = Math.cos(t * 0.08) * 50;
      camera.position.y = 15 + Math.sin(t * 0.1) * 5;
      camera.lookAt(0, 5, 0);

      if (Math.floor(t * 60) % 15 === 0) {
        updateChunks();
      }

      renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
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
      renderer.dispose();
      for (const chunk of chunks.values()) {
        chunk.geometry.dispose();
        (chunk.material as THREE.Material).dispose();
      }
      chunks.clear();
      groundGeo.dispose();
      groundMat.dispose();
      roadGeo.dispose();
      roadMat.dispose();
      streetLightGeo.dispose();
      streetLightMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
    />
  );
}
