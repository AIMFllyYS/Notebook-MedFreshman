import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface JellyParticle {
  position: THREE.Vector3;
  oldPosition: THREE.Vector3;
  velocity: THREE.Vector3;
  mass: number;
}

interface JellySpring {
  a: number;
  b: number;
  restLength: number;
  stiffness: number;
}

const SUBSTEPS = 4;
const TIMESTEP = 0.016 / SUBSTEPS;
const GRAVITY = new THREE.Vector3(0, -4, 0);
const DAMPING = 0.96;
const VOLUME_STIFFNESS = 0.3;

function createJelly(
  radius: number,
  segments: number
): { particles: JellyParticle[]; springs: JellySpring[]; geometry: THREE.IcosahedronGeometry } {
  const geometry = new THREE.IcosahedronGeometry(radius, segments);
  const posAttr = geometry.attributes.position;
  const particles: JellyParticle[] = [];
  const uniquePositions = new Map<string, number>();

  // Deduplicate vertices
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);
    const key = `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;

    if (!uniquePositions.has(key)) {
      uniquePositions.set(key, particles.length);
      particles.push({
        position: new THREE.Vector3(x, y, z),
        oldPosition: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(),
        mass: 1,
      });
    }
  }

  // Create springs from edges
  const indexAttr = geometry.index;
  const edgeSet = new Set<string>();
  const springs: JellySpring[] = [];

  if (indexAttr) {
    for (let i = 0; i < indexAttr.count; i += 3) {
      const a = indexAttr.getX(i);
      const b = indexAttr.getX(i + 1);
      const c = indexAttr.getX(i + 2);

      const edges = [
        [Math.min(a, b), Math.max(a, b)],
        [Math.min(b, c), Math.max(b, c)],
        [Math.min(a, c), Math.max(a, c)],
      ];

      for (const [e0, e1] of edges) {
        const key = `${e0},${e1}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          const p0 = particles[uniquePositions.get(`${posAttr.getX(e0).toFixed(4)},${posAttr.getY(e0).toFixed(4)},${posAttr.getZ(e0).toFixed(4)}`)!];
          const p1 = particles[uniquePositions.get(`${posAttr.getX(e1).toFixed(4)},${posAttr.getY(e1).toFixed(4)},${posAttr.getZ(e1).toFixed(4)}`)!];
          springs.push({
            a: uniquePositions.get(`${posAttr.getX(e0).toFixed(4)},${posAttr.getY(e0).toFixed(4)},${posAttr.getZ(e0).toFixed(4)}`)!,
            b: uniquePositions.get(`${posAttr.getX(e1).toFixed(4)},${posAttr.getY(e1).toFixed(4)},${posAttr.getZ(e1).toFixed(4)}`)!,
            restLength: p0.position.distanceTo(p1.position),
            stiffness: 0.8,
          });
        }
      }
    }
  }

  // Add internal springs for volume preservation
  const center = new THREE.Vector3();
  for (const p of particles) center.add(p.position);
  center.divideScalar(particles.length);

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dist = particles[i].position.distanceTo(particles[j].position);
      if (dist < radius * 0.8) {
        springs.push({
          a: i,
          b: j,
          restLength: dist,
          stiffness: 0.3,
        });
      }
    }
  }

  return { particles, springs, geometry };
}

export default function T44_SoftBodyJelly() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rafRef = useRef<number>(0);
  const jellyRef = useRef<{
    particles: JellyParticle[];
    springs: JellySpring[];
    mesh: THREE.Mesh;
    originalGeometry: THREE.IcosahedronGeometry;
  } | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 3, 6);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xff6b9d, 0.8, 20);
    pointLight.position.set(-3, 4, -3);
    scene.add(pointLight);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create jelly
    const { particles, springs, geometry } = createJelly(1.2, 2);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xff6b9d,
      roughness: 0.2,
      metalness: 0.1,
      transmission: 0.4,
      thickness: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      ior: 1.4,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    jellyRef.current = { particles, springs, mesh, originalGeometry: geometry };

    function integrate(particles: JellyParticle[]) {
      for (const p of particles) {
        p.velocity.addScaledVector(GRAVITY, TIMESTEP);
        p.velocity.multiplyScalar(DAMPING);
        p.oldPosition.copy(p.position);
        p.position.addScaledVector(p.velocity, TIMESTEP);
      }
    }

    function solveSprings(particles: JellyParticle[], springs: JellySpring[]) {
      for (const s of springs) {
        const p0 = particles[s.a];
        const p1 = particles[s.b];
        const delta = new THREE.Vector3().subVectors(p1.position, p0.position);
        const dist = delta.length();
        if (dist === 0) continue;

        const diff = (dist - s.restLength) / dist;
        const correction = delta.multiplyScalar(diff * s.stiffness * 0.5);
        p0.position.add(correction);
        p1.position.sub(correction);
      }
    }

    function solveVolume(particles: JellyParticle[]) {
      const center = new THREE.Vector3();
      for (const p of particles) center.add(p.position);
      center.divideScalar(particles.length);

      let currentVolume = 0;
      for (const p of particles) {
        currentVolume += p.position.distanceTo(center);
      }

      const targetVolume = particles.length * 1.2;
      const scale = targetVolume / (currentVolume + 0.001);

      for (const p of particles) {
        const dir = new THREE.Vector3().subVectors(p.position, center);
        p.position.addScaledVector(dir, (scale - 1) * VOLUME_STIFFNESS);
      }
    }

    function solveFloor(particles: JellyParticle[]) {
      for (const p of particles) {
        if (p.position.y < -2 + 0.1) {
          p.position.y = -2 + 0.1;
          p.velocity.y *= -0.5;
          p.velocity.x *= 0.9;
          p.velocity.z *= 0.9;
        }
      }
    }

    function updateGeometry(particles: JellyParticle[], mesh: THREE.Mesh) {
      const geo = mesh.geometry as THREE.IcosahedronGeometry;
      const posAttr = geo.attributes.position;

      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const z = posAttr.getZ(i);

        // Find closest particle
        let closest = particles[0];
        let minDist = Infinity;
        for (const p of particles) {
          const d = Math.abs(p.position.x - x) + Math.abs(p.position.y - y) + Math.abs(p.position.z - z);
          if (d < minDist) {
            minDist = d;
            closest = p;
          }
        }

        posAttr.setXYZ(i, closest.position.x, closest.position.y, closest.position.z);
      }

      posAttr.needsUpdate = true;
      geo.computeVertexNormals();
    }

    function animate() {
      rafRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;
      const t = timeRef.current;

      const jelly = jellyRef.current;
      if (!jelly) return;

      // Apply external forces
      for (let i = 0; i < jelly.particles.length; i++) {
        const p = jelly.particles[i];
        const force = new THREE.Vector3(
          Math.sin(t * 2 + i * 0.5) * 0.5,
          Math.cos(t * 3 + i * 0.3) * 0.3,
          Math.sin(t * 1.5 + i * 0.7) * 0.5
        );
        p.velocity.add(force);
      }

      for (let step = 0; step < SUBSTEPS; step++) {
        integrate(jelly.particles);
        solveSprings(jelly.particles, jelly.springs);
        solveVolume(jelly.particles);
        solveFloor(jelly.particles);
      }

      // Update velocities from position changes
      for (const p of jelly.particles) {
        p.velocity.subVectors(p.position, p.oldPosition).divideScalar(TIMESTEP);
      }

      updateGeometry(jelly.particles, jelly.mesh);

      // Rotate entire jelly slowly
      jelly.mesh.rotation.y = Math.sin(t * 0.5) * 0.2;

      camera.position.x = Math.sin(t * 0.3) * 6;
      camera.position.z = Math.cos(t * 0.3) * 6;
      camera.lookAt(0, 0, 0);

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
      geometry.dispose();
      material.dispose();
      groundGeo.dispose();
      groundMat.dispose();
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
