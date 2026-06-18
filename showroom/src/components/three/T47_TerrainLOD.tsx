import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface TerrainChunk {
  mesh: THREE.Mesh;
  x: number;
  z: number;
  lod: number;
}

function noise2D(x: number, z: number): number {
  const sx = Math.sin(x * 0.05) * 2 + Math.sin(x * 0.15) * 1 + Math.sin(x * 0.01) * 8;
  const sz = Math.cos(z * 0.05) * 2 + Math.cos(z * 0.15) * 1 + Math.cos(z * 0.01) * 8;
  const detail = Math.sin(x * 0.3 + z * 0.2) * 0.3 + Math.sin(x * 0.7 - z * 0.4) * 0.15;
  return sx + sz + detail;
}

function getHeight(x: number, z: number): number {
  return noise2D(x, z);
}

function createChunkGeometry(cx: number, cz: number, size: number, segments: number): THREE.PlaneGeometry {
  const geo = new THREE.PlaneGeometry(size, size, segments, segments);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const wx = pos.getX(i) + cx;
    const wz = pos.getZ(i) + cz;
    const h = getHeight(wx, wz);
    pos.setY(i, h);
  }

  geo.computeVertexNormals();
  return geo;
}

function getLOD(distance: number): number {
  if (distance < 20) return 0;
  if (distance < 40) return 1;
  if (distance < 80) return 2;
  return 3;
}

function getSegments(lod: number): number {
  return [32, 16, 8, 4][lod];
}

function getColorForHeight(h: number): THREE.Color {
  const color = new THREE.Color();
  if (h < -2) {
    color.setHex(0x2d5016); // Deep green
  } else if (h < 0) {
    color.setHex(0x4a7c2e); // Green
  } else if (h < 3) {
    color.setHex(0x8b7355); // Brown
  } else if (h < 6) {
    color.setHex(0x9e9e9e); // Gray
  } else {
    color.setHex(0xffffff); // Snow
  }
  return color;
}

export default function T47_TerrainLOD() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rafRef = useRef<number>(0);
  const chunksRef = useRef<Map<string, TerrainChunk>>(new Map());
  const timeRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 50, 150);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      200
    );
    camera.position.set(0, 15, 30);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(50, 50, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    scene.add(dirLight);

    const chunkSize = 20;
    const chunkCount = 6;
    const chunks = chunksRef.current;

    function updateChunks() {
      const camX = camera.position.x;
      const camZ = camera.position.z;

      // Determine needed chunks
      const neededChunks = new Set<string>();
      for (let x = -chunkCount; x <= chunkCount; x++) {
        for (let z = -chunkCount; z <= chunkCount; z++) {
          const cx = Math.floor((camX + x * chunkSize) / chunkSize) * chunkSize;
          const cz = Math.floor((camZ + z * chunkSize) / chunkSize) * chunkSize;
          const key = `${cx},${cz}`;
          neededChunks.add(key);

          const dist = Math.sqrt((cx - camX) ** 2 + (cz - camZ) ** 2);
          const lod = getLOD(dist);

          if (chunks.has(key)) {
            const chunk = chunks.get(key)!;
            if (chunk.lod !== lod) {
              // Update LOD
              scene.remove(chunk.mesh);
              chunk.mesh.geometry.dispose();
              (chunk.mesh.material as THREE.Material).dispose();

              const geo = createChunkGeometry(cx, cz, chunkSize, getSegments(lod));
              const mat = new THREE.MeshStandardMaterial({
                color: getColorForHeight(getHeight(cx, cz)),
                roughness: 0.9,
                flatShading: lod > 1,
              });
              const mesh = new THREE.Mesh(geo, mat);
              mesh.position.set(cx, 0, cz);
              mesh.receiveShadow = true;
              mesh.castShadow = true;
              scene.add(mesh);

              chunk.mesh = mesh;
              chunk.lod = lod;
            }
          } else {
            const geo = createChunkGeometry(cx, cz, chunkSize, getSegments(lod));
            const mat = new THREE.MeshStandardMaterial({
              color: getColorForHeight(getHeight(cx, cz)),
              roughness: 0.9,
              flatShading: lod > 1,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(cx, 0, cz);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            scene.add(mesh);

            chunks.set(key, { mesh, x: cx, z: cz, lod });
          }
        }
      }

      // Remove old chunks
      for (const [key, chunk] of chunks.entries()) {
        if (!neededChunks.has(key)) {
          scene.remove(chunk.mesh);
          chunk.mesh.geometry.dispose();
          (chunk.mesh.material as THREE.Material).dispose();
          chunks.delete(key);
        }
      }
    }

    // Water plane
    const waterGeo = new THREE.PlaneGeometry(300, 300);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x1e6091,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.7,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = -2;
    scene.add(water);

    updateChunks();

    function animate() {
      rafRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;
      const t = timeRef.current;

      // Flyover camera
      camera.position.x = Math.sin(t * 0.1) * 40;
      camera.position.z = Math.cos(t * 0.1) * 40;
      camera.position.y = 15 + Math.sin(t * 0.2) * 5;
      camera.lookAt(0, 0, 0);

      // Update chunks every few frames
      if (Math.floor(t * 60) % 10 === 0) {
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
        chunk.mesh.geometry.dispose();
        (chunk.mesh.material as THREE.Material).dispose();
      }
      chunks.clear();
      waterGeo.dispose();
      waterMat.dispose();
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
