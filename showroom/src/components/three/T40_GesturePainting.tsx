import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  color: THREE.Color;
  size: number;
}

const T40_GesturePainting: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Particles
    const maxParticles = 5000;
    const particles: Particle[] = [];
    const positions = new Float32Array(maxParticles * 3);
    const colors = new Float32Array(maxParticles * 3);
    const sizes = new Float32Array(maxParticles);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Trail lines
    const trailPositions: number[] = [];
    const trailColors: number[] = [];
    const trailGeometry = new THREE.BufferGeometry();
    trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailPositions, 3));
    trailGeometry.setAttribute('color', new THREE.Float32BufferAttribute(trailColors, 3));
    const trailMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const trailLine = new THREE.LineSegments(trailGeometry, trailMaterial);
    scene.add(trailLine);

    // Input handling
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const targetPoint = new THREE.Vector3();
    let isDrawing = false;
    let hue = 0;

    const getPointOnPlane = (clientX: number, clientY: number): THREE.Vector3 => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(plane, targetPoint);
      return targetPoint.clone();
    };

    const spawnParticles = (pos: THREE.Vector3, count: number) => {
      for (let i = 0; i < count; i++) {
        if (particles.length >= maxParticles) {
          particles.shift();
        }
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.02 + Math.random() * 0.08;
        const p: Particle = {
          position: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, 0)),
          velocity: new THREE.Vector3(Math.cos(angle) * speed, Math.sin(angle) * speed, (Math.random() - 0.5) * 0.02),
          life: 1.0,
          maxLife: 1.0 + Math.random() * 1.5,
          color: new THREE.Color().setHSL(hue, 0.8 + Math.random() * 0.2, 0.5 + Math.random() * 0.3),
          size: 0.1 + Math.random() * 0.2,
        };
        particles.push(p);
      }
    };

    let lastPoint: THREE.Vector3 | null = null;

    const onPointerDown = (e: PointerEvent) => {
      isDrawing = true;
      const pos = getPointOnPlane(e.clientX, e.clientY);
      lastPoint = pos;
      spawnParticles(pos, 20);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDrawing) return;
      const pos = getPointOnPlane(e.clientX, e.clientY);
      spawnParticles(pos, 10);

      if (lastPoint) {
        // Add trail segment
        trailPositions.push(lastPoint.x, lastPoint.y, lastPoint.z);
        trailPositions.push(pos.x, pos.y, pos.z);
        const c = new THREE.Color().setHSL(hue, 1.0, 0.6);
        trailColors.push(c.r, c.g, c.b);
        trailColors.push(c.r, c.g, c.b);

        // Limit trail length
        const maxTrailSegments = 2000;
        if (trailPositions.length > maxTrailSegments * 3) {
          trailPositions.splice(0, 6);
          trailColors.splice(0, 6);
        }
      }
      lastPoint = pos;
      hue = (hue + 0.002) % 1;
    };

    const onPointerUp = () => {
      isDrawing = false;
      lastPoint = null;
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointerleave', onPointerUp);

    // Animation
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= delta;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        p.position.add(p.velocity);
        p.velocity.y -= 0.001; // slight gravity
        p.velocity.multiplyScalar(0.99);
      }

      // Update buffers
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = geometry.attributes.color as THREE.BufferAttribute;
      const sizeAttr = geometry.attributes.size as THREE.BufferAttribute;

      for (let i = 0; i < maxParticles; i++) {
        if (i < particles.length) {
          const p = particles[i];
          posAttr.setXYZ(i, p.position.x, p.position.y, p.position.z);
          colAttr.setXYZ(i, p.color.r, p.color.g, p.color.b);
          sizeAttr.setX(i, p.size * (p.life / p.maxLife));
        } else {
          posAttr.setXYZ(i, 0, 0, 0);
          colAttr.setXYZ(i, 0, 0, 0);
          sizeAttr.setX(i, 0);
        }
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;

      // Update trail
      trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailPositions, 3));
      trailGeometry.setAttribute('color', new THREE.Float32BufferAttribute(trailColors, 3));
      trailGeometry.attributes.position.needsUpdate = true;
      trailGeometry.attributes.color.needsUpdate = true;

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
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointerleave', onPointerUp);
      cancelAnimationFrame(rafRef.current);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      trailGeometry.dispose();
      trailMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', overflow: 'hidden', touchAction: 'none' }}
    />
  );
};

export default T40_GesturePainting;
