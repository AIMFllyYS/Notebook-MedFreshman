import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  density: number;
  pressure: number;
}

const T24_ParticleFluid: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rafRef = useRef<number>(0);
  const particlesDataRef = useRef<Particle[]>([]);
  const pointsRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 20, 40);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // SPH parameters
    const particleCount = 400;
    const smoothingRadius = 3.5;
    const restDensity = 1.0;
    const gasConstant = 0.5;
    const viscosity = 0.08;
    const gravity = new THREE.Vector3(0, -0.8, 0);
    const mass = 1.0;

    // Initialize particles
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20 + 5,
          (Math.random() - 0.5) * 10
        ),
        velocity: new THREE.Vector3(0, 0, 0),
        acceleration: new THREE.Vector3(0, 0, 0),
        density: 0,
        pressure: 0,
      });
    }
    particlesDataRef.current = particles;

    // Geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    pointsRef.current = points;

    // Kernel functions
    const poly6Kernel = (r: number, h: number): number => {
      if (r > h) return 0;
      const factor = 315 / (64 * Math.PI * Math.pow(h, 9));
      return factor * Math.pow(h * h - r * r, 3);
    };

    const spikyGradient = (r: number, h: number): number => {
      if (r > h || r === 0) return 0;
      const factor = -45 / (Math.PI * Math.pow(h, 6));
      return factor * Math.pow(h - r, 2);
    };

    const viscosityLaplacian = (r: number, h: number): number => {
      if (r > h) return 0;
      const factor = 45 / (Math.PI * Math.pow(h, 6));
      return factor * (h - r);
    };

    // Animation
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      const dt = 0.016;

      const p = particlesDataRef.current;

      // Compute density and pressure
      for (let i = 0; i < particleCount; i++) {
        let density = 0;
        for (let j = 0; j < particleCount; j++) {
          const r = p[i].position.distanceTo(p[j].position);
          density += mass * poly6Kernel(r, smoothingRadius);
        }
        p[i].density = Math.max(density, 0.001);
        p[i].pressure = gasConstant * (p[i].density - restDensity);
      }

      // Compute forces
      for (let i = 0; i < particleCount; i++) {
        const pressureForce = new THREE.Vector3(0, 0, 0);
        const viscousForce = new THREE.Vector3(0, 0, 0);

        for (let j = 0; j < particleCount; j++) {
          if (i === j) continue;
          const diff = new THREE.Vector3().subVectors(p[i].position, p[j].position);
          const r = diff.length();
          if (r > smoothingRadius || r === 0) continue;

          // Pressure force
          const pressureGrad =
            -mass *
            (p[i].pressure + p[j].pressure) /
            (2 * p[j].density) *
            spikyGradient(r, smoothingRadius);
          diff.normalize();
          pressureForce.add(diff.multiplyScalar(pressureGrad));

          // Viscosity force
          const velDiff = new THREE.Vector3().subVectors(p[j].velocity, p[i].velocity);
          const visc =
            (viscosity * mass / p[j].density) * viscosityLaplacian(r, smoothingRadius);
          viscousForce.add(velDiff.multiplyScalar(visc));
        }

        p[i].acceleration.copy(pressureForce).add(viscousForce).divideScalar(p[i].density).add(gravity);
      }

      // Integrate
      const bounds = 15;
      const damping = 0.5;
      for (let i = 0; i < particleCount; i++) {
        p[i].velocity.add(p[i].acceleration.clone().multiplyScalar(dt));
        p[i].position.add(p[i].velocity.clone().multiplyScalar(dt));

        // Boundary conditions
        if (p[i].position.x < -bounds) {
          p[i].position.x = -bounds;
          p[i].velocity.x *= -damping;
        }
        if (p[i].position.x > bounds) {
          p[i].position.x = bounds;
          p[i].velocity.x *= -damping;
        }
        if (p[i].position.y < -10) {
          p[i].position.y = -10;
          p[i].velocity.y *= -damping;
        }
        if (p[i].position.y > 20) {
          p[i].position.y = 20;
          p[i].velocity.y *= -damping;
        }
        if (p[i].position.z < -5) {
          p[i].position.z = -5;
          p[i].velocity.z *= -damping;
        }
        if (p[i].position.z > 5) {
          p[i].position.z = 5;
          p[i].velocity.z *= -damping;
        }
      }

      // Update geometry
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = geometry.attributes.color as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        posAttr.setXYZ(i, p[i].position.x, p[i].position.y, p[i].position.z);
        const speed = p[i].velocity.length();
        const hue = 0.55 + Math.min(speed * 0.1, 0.25);
        const color = new THREE.Color().setHSL(hue, 0.8, 0.5 + Math.min(speed * 0.05, 0.4));
        colAttr.setXYZ(i, color.r, color.g, color.b);
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Resize
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
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
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

export default T24_ParticleFluid;
