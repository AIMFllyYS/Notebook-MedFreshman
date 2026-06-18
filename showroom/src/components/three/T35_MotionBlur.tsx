import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// Motion blur via velocity-based directional blur approximation
const motionBlurShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    velocity: { value: new THREE.Vector2(0, 0) },
    intensity: { value: 0.8 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 velocity;
    uniform float intensity;
    varying vec2 vUv;

    void main() {
      vec4 color = vec4(0.0);
      float total = 0.0;
      int samples = 16;

      for (int i = 0; i < 16; i++) {
        float t = float(i) / float(samples - 1);
        vec2 offset = velocity * (t - 0.5) * intensity;
        float weight = 1.0 - abs(t - 0.5) * 2.0;
        color += texture2D(tDiffuse, vUv + offset) * weight;
        total += weight;
      }

      gl_FragColor = color / total;
    }
  `,
};

const T35_MotionBlur: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const motionPass = new ShaderPass(motionBlurShader);
    composer.addPass(motionPass);
    composerRef.current = composer;

    // Fast moving objects
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xff5555, roughness: 0.3 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    scene.add(box);

    const sphereGeo = new THREE.SphereGeometry(0.6, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({ color: 0x55ff55, roughness: 0.3 });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    const torusGeo = new THREE.TorusGeometry(0.5, 0.2, 16, 50);
    const torusMat = new THREE.MeshStandardMaterial({ color: 0x5555ff, roughness: 0.3 });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    scene.add(torus);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 5, 3);
    scene.add(dirLight);

    let time = 0;
    let prevPos = new THREE.Vector3();
    let currPos = new THREE.Vector3();

    const animate = () => {
      time += 0.02;

      // Fast circular motion
      const r = 3;
      const speed = 4;
      box.position.set(Math.cos(time * speed) * r, Math.sin(time * speed * 0.5), Math.sin(time * speed) * r);
      box.rotation.x += 0.1;
      box.rotation.y += 0.1;

      sphere.position.set(Math.cos(time * speed + 2) * r * 0.7, Math.sin(time * speed * 0.8 + 1), Math.sin(time * speed + 2) * r * 0.7);

      torus.position.set(Math.cos(time * speed + 4) * r * 0.5, Math.cos(time * speed * 0.6 + 3), Math.sin(time * speed + 4) * r * 0.5);
      torus.rotation.x += 0.05;
      torus.rotation.y += 0.08;

      // Compute screen-space velocity of the box for motion blur direction
      currPos.copy(box.position);
      currPos.project(camera);
      const velocityX = (currPos.x - prevPos.x) * 0.5;
      const velocityY = (currPos.y - prevPos.y) * 0.5;
      prevPos.copy(currPos);

      motionPass.uniforms['velocity'].value.set(velocityX, velocityY);
      motionPass.uniforms['intensity'].value = 0.5 + Math.abs(Math.sin(time)) * 0.5;

      composer.render();
      rafRef.current = requestAnimationFrame(animate);
    };

    // Initialize prevPos
    box.position.set(Math.cos(0) * 3, Math.sin(0), Math.sin(0) * 3);
    box.position.project(camera);
    prevPos.set(box.position.x, box.position.y, box.position.z);

    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
      composer.dispose();
      renderer.dispose();
      boxGeo.dispose();
      boxMat.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      torusGeo.dispose();
      torusMat.dispose();
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

export default T35_MotionBlur;
