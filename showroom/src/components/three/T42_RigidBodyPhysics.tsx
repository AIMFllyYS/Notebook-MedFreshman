import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface RigidBody {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  radius: number;
  mass: number;
  size: THREE.Vector3;
  type: 'sphere' | 'box';
}

const GRAVITY = new THREE.Vector3(0, -9.8, 0);
const TIMESTEP = 0.016;
const RESTITUTION = 0.6;
const FRICTION = 0.98;

function createSphere(radius: number, color: number, pos: THREE.Vector3): RigidBody {
  const geo = new THREE.SphereGeometry(radius, 16, 16);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.3 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(pos);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return {
    mesh,
    velocity: new THREE.Vector3((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2),
    angularVelocity: new THREE.Vector3(Math.random(), Math.random(), Math.random()),
    radius,
    mass: radius * radius * radius,
    size: new THREE.Vector3(radius, radius, radius),
    type: 'sphere',
  };
}

function createBox(size: THREE.Vector3, color: number, pos: THREE.Vector3): RigidBody {
  const geo = new THREE.BoxGeometry(size.x * 2, size.y * 2, size.z * 2);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.3 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(pos);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return {
    mesh,
    velocity: new THREE.Vector3((Math.random() - 0.5) * 1, 0, (Math.random() - 0.5) * 1),
    angularVelocity: new THREE.Vector3(Math.random(), Math.random(), Math.random()),
    radius: Math.max(size.x, size.y, size.z),
    mass: size.x * size.y * size.z * 8,
    size,
    type: 'box',
  };
}

function sphereSphereCollision(a: RigidBody, b: RigidBody): boolean {
  const dist = a.mesh.position.distanceTo(b.mesh.position);
  return dist < a.radius + b.radius;
}

function resolveSphereCollision(a: RigidBody, b: RigidBody) {
  const normal = new THREE.Vector3().subVectors(b.mesh.position, a.mesh.position);
  const dist = normal.length();
  normal.normalize();

  const overlap = a.radius + b.radius - dist;
  const totalMass = a.mass + b.mass;
  a.mesh.position.addScaledVector(normal, -overlap * (b.mass / totalMass));
  b.mesh.position.addScaledVector(normal, overlap * (a.mass / totalMass));

  const relVel = new THREE.Vector3().subVectors(a.velocity, b.velocity);
  const velAlongNormal = relVel.dot(normal);

  if (velAlongNormal > 0) return;

  const j = -(1 + RESTITUTION) * velAlongNormal / (1 / a.mass + 1 / b.mass);
  const impulse = normal.clone().multiplyScalar(j);

  a.velocity.addScaledVector(impulse, 1 / a.mass);
  b.velocity.addScaledVector(impulse, -1 / b.mass);
}

function boxBoxCollision(a: RigidBody, b: RigidBody): boolean {
  const ap = a.mesh.position;
  const bp = b.mesh.position;
  return (
    Math.abs(ap.x - bp.x) < a.size.x + b.size.x &&
    Math.abs(ap.y - bp.y) < a.size.y + b.size.y &&
    Math.abs(ap.z - bp.z) < a.size.z + b.size.z
  );
}

function resolveBoxCollision(a: RigidBody, b: RigidBody) {
  const normal = new THREE.Vector3().subVectors(b.mesh.position, a.mesh.position);
  const dx = a.size.x + b.size.x - Math.abs(normal.x);
  const dy = a.size.y + b.size.y - Math.abs(normal.y);
  const dz = a.size.z + b.size.z - Math.abs(normal.z);

  let minAxis = 'x';
  let minPen = dx;
  if (dy < minPen) { minPen = dy; minAxis = 'y'; }
  if (dz < minPen) { minPen = dz; minAxis = 'z'; }

  const axis = new THREE.Vector3(minAxis === 'x' ? 1 : 0, minAxis === 'y' ? 1 : 0, minAxis === 'z' ? 1 : 0);
  if (normal.dot(axis) < 0) axis.negate();

  const totalMass = a.mass + b.mass;
  a.mesh.position.addScaledVector(axis, -minPen * (b.mass / totalMass));
  b.mesh.position.addScaledVector(axis, minPen * (a.mass / totalMass));

  const relVel = new THREE.Vector3().subVectors(a.velocity, b.velocity);
  const velAlongNormal = relVel.dot(axis);

  if (velAlongNormal > 0) return;

  const j = -(1 + RESTITUTION) * velAlongNormal / (1 / a.mass + 1 / b.mass);
  const impulse = axis.clone().multiplyScalar(j);

  a.velocity.addScaledVector(impulse, 1 / a.mass);
  b.velocity.addScaledVector(impulse, -1 / b.mass);
}

export default function T42_RigidBodyPhysics() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rafRef = useRef<number>(0);
  const bodiesRef = useRef<RigidBody[]>([]);

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
    camera.position.set(0, 12, 20);
    camera.lookAt(0, 2, 0);
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
    dirLight.position.set(8, 15, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0xff6b6b, 0.6);
    spotLight.position.set(-8, 10, -5);
    scene.add(spotLight);

    // Ground
    const groundGeo = new THREE.BoxGeometry(20, 1, 20);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.8 });
    const wallGeo1 = new THREE.BoxGeometry(1, 8, 20);
    const wall1 = new THREE.Mesh(wallGeo1, wallMat);
    wall1.position.set(-10, 3.5, 0);
    wall1.receiveShadow = true;
    scene.add(wall1);

    const wall2 = new THREE.Mesh(wallGeo1, wallMat);
    wall2.position.set(10, 3.5, 0);
    wall2.receiveShadow = true;
    scene.add(wall2);

    const wallGeo2 = new THREE.BoxGeometry(20, 8, 1);
    const wall3 = new THREE.Mesh(wallGeo2, wallMat);
    wall3.position.set(0, 3.5, -10);
    wall3.receiveShadow = true;
    scene.add(wall3);

    const wall4 = new THREE.Mesh(wallGeo2, wallMat);
    wall4.position.set(0, 3.5, 10);
    wall4.receiveShadow = true;
    scene.add(wall4);

    const bodies: RigidBody[] = [];
    const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6, 0x1abc9c, 0xe67e22, 0xecf0f1];

    // Create spheres
    for (let i = 0; i < 6; i++) {
      const radius = 0.4 + Math.random() * 0.6;
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        3 + i * 2.5,
        (Math.random() - 0.5) * 8
      );
      const body = createSphere(radius, colors[i % colors.length], pos);
      scene.add(body.mesh);
      bodies.push(body);
    }

    // Create boxes
    for (let i = 0; i < 5; i++) {
      const size = new THREE.Vector3(
        0.3 + Math.random() * 0.5,
        0.3 + Math.random() * 0.5,
        0.3 + Math.random() * 0.5
      );
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        4 + i * 2.5,
        (Math.random() - 0.5) * 8
      );
      const body = createBox(size, colors[(i + 6) % colors.length], pos);
      scene.add(body.mesh);
      bodies.push(body);
    }

    bodiesRef.current = bodies;

    function integrate(body: RigidBody) {
      body.velocity.addScaledVector(GRAVITY, TIMESTEP);
      body.mesh.position.addScaledVector(body.velocity, TIMESTEP);

      body.mesh.rotation.x += body.angularVelocity.x * TIMESTEP;
      body.mesh.rotation.y += body.angularVelocity.y * TIMESTEP;
      body.mesh.rotation.z += body.angularVelocity.z * TIMESTEP;

      body.velocity.multiplyScalar(FRICTION);
      body.angularVelocity.multiplyScalar(FRICTION);
    }

    function solveGroundCollision(body: RigidBody) {
      if (body.type === 'sphere') {
        if (body.mesh.position.y - body.radius < 0) {
          body.mesh.position.y = body.radius;
          body.velocity.y *= -RESTITUTION;
          body.velocity.x *= 0.95;
          body.velocity.z *= 0.95;
        }
      } else {
        if (body.mesh.position.y - body.size.y < 0) {
          body.mesh.position.y = body.size.y;
          body.velocity.y *= -RESTITUTION;
        }
      }
    }

    function solveWallCollisions(body: RigidBody) {
      const bounds = body.type === 'sphere' ? body.radius : body.size.x;
      const boundsZ = body.type === 'sphere' ? body.radius : body.size.z;

      if (body.mesh.position.x - bounds < -9.5) {
        body.mesh.position.x = -9.5 + bounds;
        body.velocity.x *= -RESTITUTION;
      }
      if (body.mesh.position.x + bounds > 9.5) {
        body.mesh.position.x = 9.5 - bounds;
        body.velocity.x *= -RESTITUTION;
      }
      if (body.mesh.position.z - boundsZ < -9.5) {
        body.mesh.position.z = -9.5 + boundsZ;
        body.velocity.z *= -RESTITUTION;
      }
      if (body.mesh.position.z + boundsZ > 9.5) {
        body.mesh.position.z = 9.5 - boundsZ;
        body.velocity.z *= -RESTITUTION;
      }
    }

    function animate() {
      rafRef.current = requestAnimationFrame(animate);

      for (const body of bodies) {
        integrate(body);
        solveGroundCollision(body);
        solveWallCollisions(body);
      }

      // Body-body collisions
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i];
          const b = bodies[j];

          if (a.type === 'sphere' && b.type === 'sphere') {
            if (sphereSphereCollision(a, b)) {
              resolveSphereCollision(a, b);
            }
          } else if (a.type === 'box' && b.type === 'box') {
            if (boxBoxCollision(a, b)) {
              resolveBoxCollision(a, b);
            }
          } else {
            // Sphere-box simplified as sphere-sphere
            if (sphereSphereCollision(a, b)) {
              resolveSphereCollision(a, b);
            }
          }
        }
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
      for (const body of bodies) {
        body.mesh.geometry.dispose();
        (body.mesh.material as THREE.Material).dispose();
      }
      groundGeo.dispose();
      groundMat.dispose();
      wallGeo1.dispose();
      wallGeo2.dispose();
      wallMat.dispose();
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
