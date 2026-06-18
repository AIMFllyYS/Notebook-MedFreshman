import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface Particle {
  x: number;
  y: number;
  z: number;
  oldX: number;
  oldY: number;
  oldZ: number;
  pinned: boolean;
}

interface Constraint {
  p0: number;
  p1: number;
  restLength: number;
}

const CLOTH_WIDTH = 12;
const CLOTH_HEIGHT = 10;
const SEGMENTS_X = 20;
const SEGMENTS_Y = 16;
const GRAVITY = -9.8;
const TIMESTEP = 0.016;
const ITERATIONS = 3;

function createParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let y = 0; y <= SEGMENTS_Y; y++) {
    for (let x = 0; x <= SEGMENTS_X; x++) {
      const px = (x / SEGMENTS_X - 0.5) * CLOTH_WIDTH;
      const py = CLOTH_HEIGHT / 2;
      const pz = (y / SEGMENTS_Y - 0.5) * CLOTH_HEIGHT;
      particles.push({
        x: px,
        y: py,
        z: pz,
        oldX: px,
        oldY: py,
        oldZ: pz,
        pinned: y === 0 && (x % 4 === 0),
      });
    }
  }
  return particles;
}

function createConstraints(): Constraint[] {
  const constraints: Constraint[] = [];
  const getIndex = (x: number, y: number) => y * (SEGMENTS_X + 1) + x;

  for (let y = 0; y <= SEGMENTS_Y; y++) {
    for (let x = 0; x <= SEGMENTS_X; x++) {
      if (x < SEGMENTS_X) {
        constraints.push({
          p0: getIndex(x, y),
          p1: getIndex(x + 1, y),
          restLength: CLOTH_WIDTH / SEGMENTS_X,
        });
      }
      if (y < SEGMENTS_Y) {
        constraints.push({
          p0: getIndex(x, y),
          p1: getIndex(x, y + 1),
          restLength: CLOTH_HEIGHT / SEGMENTS_Y,
        });
      }
    }
  }
  return constraints;
}

export default function T41_ClothSimulation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rafRef = useRef<number>(0);
  const clothMeshRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const constraintsRef = useRef<Constraint[]>([]);
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
    camera.position.set(0, 5, 18);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x00d4ff, 0.8);
    spotLight.position.set(-5, 8, -5);
    spotLight.angle = Math.PI / 4;
    scene.add(spotLight);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(40, 40);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f0f23,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Cloth geometry
    const geometry = new THREE.PlaneGeometry(
      CLOTH_WIDTH,
      CLOTH_HEIGHT,
      SEGMENTS_X,
      SEGMENTS_Y
    );
    const material = new THREE.MeshStandardMaterial({
      color: 0xe74c3c,
      side: THREE.DoubleSide,
      roughness: 0.6,
      metalness: 0.1,
      flatShading: false,
    });
    const clothMesh = new THREE.Mesh(geometry, material);
    clothMesh.castShadow = true;
    clothMesh.receiveShadow = true;
    scene.add(clothMesh);
    clothMeshRef.current = clothMesh;

    // Sphere obstacle
    const sphereGeo = new THREE.SphereGeometry(2, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x3498db,
      roughness: 0.3,
      metalness: 0.5,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(0, -1, 0);
    sphere.castShadow = true;
    scene.add(sphere);

    particlesRef.current = createParticles();
    constraintsRef.current = createConstraints();

    const windForce = new THREE.Vector3();

    function verletIntegrate(particles: Particle[]) {
      for (const p of particles) {
        if (p.pinned) continue;

        const vx = (p.x - p.oldX) * 0.98;
        const vy = (p.y - p.oldY) * 0.98;
        const vz = (p.z - p.oldZ) * 0.98;

        p.oldX = p.x;
        p.oldY = p.y;
        p.oldZ = p.z;

        p.x += vx;
        p.y += vy + GRAVITY * TIMESTEP * TIMESTEP * 0.5;
        p.z += vz;

        // Wind
        p.x += windForce.x * TIMESTEP * TIMESTEP;
        p.y += windForce.y * TIMESTEP * TIMESTEP;
        p.z += windForce.z * TIMESTEP * TIMESTEP;
      }
    }

    function solveConstraints(particles: Particle[], constraints: Constraint[]) {
      for (let i = 0; i < ITERATIONS; i++) {
        for (const c of constraints) {
          const p0 = particles[c.p0];
          const p1 = particles[c.p1];

          const dx = p1.x - p0.x;
          const dy = p1.y - p0.y;
          const dz = p1.z - p0.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist === 0) continue;

          const diff = (dist - c.restLength) / dist;
          const offsetX = dx * diff * 0.5;
          const offsetY = dy * diff * 0.5;
          const offsetZ = dz * diff * 0.5;

          if (!p0.pinned) {
            p0.x += offsetX;
            p0.y += offsetY;
            p0.z += offsetZ;
          }
          if (!p1.pinned) {
            p1.x -= offsetX;
            p1.y -= offsetY;
            p1.z -= offsetZ;
          }
        }
      }
    }

    function solveCollisions(particles: Particle[]) {
      const sphereCenter = new THREE.Vector3(0, -1, 0);
      const sphereRadius = 2.2;

      for (const p of particles) {
        const dx = p.x - sphereCenter.x;
        const dy = p.y - sphereCenter.y;
        const dz = p.z - sphereCenter.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < sphereRadius) {
          const factor = (sphereRadius - dist) / dist;
          p.x += dx * factor;
          p.y += dy * factor;
          p.z += dz * factor;
        }

        if (p.y < -5) {
          p.y = -5;
        }
      }
    }

    function updateGeometry(particles: Particle[]) {
      const geo = clothMesh.geometry as THREE.PlaneGeometry;
      const positions = geo.attributes.position.array as Float32Array;

      for (let i = 0; i < particles.length; i++) {
        positions[i * 3] = particles[i].x;
        positions[i * 3 + 1] = particles[i].y;
        positions[i * 3 + 2] = particles[i].z;
      }

      geo.attributes.position.needsUpdate = true;
      geo.computeVertexNormals();
    }

    function animate() {
      rafRef.current = requestAnimationFrame(animate);
      timeRef.current += TIMESTEP;

      const t = timeRef.current;
      windForce.set(
        Math.sin(t * 2) * 3 + Math.sin(t * 0.5) * 1.5,
        Math.cos(t * 1.5) * 0.5,
        Math.sin(t * 1.2) * 2
      );

      const particles = particlesRef.current;
      const constraints = constraintsRef.current;

      verletIntegrate(particles);
      solveConstraints(particles, constraints);
      solveCollisions(particles);
      updateGeometry(particles);

      sphere.position.y = -1 + Math.sin(t) * 0.5;

      camera.position.x = Math.sin(t * 0.2) * 18;
      camera.position.z = Math.cos(t * 0.2) * 18;
      camera.lookAt(0, 2, 0);

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
      sphereGeo.dispose();
      sphereMat.dispose();
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
