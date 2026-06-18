import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// Custom LUT / Color grading shader
const colorGradeShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    contrast: { value: 1.2 },
    saturation: { value: 1.3 },
    brightness: { value: 0.05 },
    colorTint: { value: new THREE.Vector3(1.0, 0.95, 0.9) },
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
    uniform float contrast;
    uniform float saturation;
    uniform float brightness;
    uniform vec3 colorTint;
    varying vec2 vUv;

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 color = texel.rgb;

      // Brightness
      color += brightness;

      // Contrast
      color = (color - 0.5) * contrast + 0.5;

      // Saturation
      float luminance = dot(color, vec3(0.299, 0.587, 0.114));
      color = mix(vec3(luminance), color, saturation);

      // Color tint
      color *= colorTint;

      // ACES-like tone mapping approximation
      color *= 0.8;
      float a = 2.51;
      float b = 0.03;
      float c = 2.43;
      float d = 0.59;
      float e = 0.14;
      color = clamp((color * (a * color + b)) / (color * (c * color + d) + e), 0.0, 1.0);

      gl_FragColor = vec4(color, texel.a);
    }
  `,
};

const T33_ToneMapping: React.FC = () => {
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
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // We do tone mapping in post-processing shader, disable renderer TM
    renderer.toneMapping = THREE.NoToneMapping;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const gradePass = new ShaderPass(colorGradeShader);
    composer.addPass(gradePass);
    composerRef.current = composer;

    // HDR-like scene: very bright and dark areas
    const sphereGeo = new THREE.SphereGeometry(1, 64, 64);

    // Bright emissive sphere
    const brightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffaa00,
      emissiveIntensity: 5.0,
      roughness: 0.1,
      metalness: 0.5,
    });
    const brightSphere = new THREE.Mesh(sphereGeo, brightMat);
    brightSphere.position.set(-2, 1, 0);
    scene.add(brightSphere);

    // Dark sphere
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.9,
      metalness: 0.1,
    });
    const darkSphere = new THREE.Mesh(sphereGeo, darkMat);
    darkSphere.position.set(2, 1, 0);
    scene.add(darkSphere);

    // Middle sphere
    const midMat = new THREE.MeshStandardMaterial({
      color: 0x4488ff,
      roughness: 0.4,
      metalness: 0.6,
    });
    const midSphere = new THREE.Mesh(sphereGeo, midMat);
    midSphere.position.set(0, 1, 2);
    scene.add(midSphere);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1;
    scene.add(floor);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambient);
    const pointLight = new THREE.PointLight(0xffffff, 10, 50);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);
    const spotLight = new THREE.SpotLight(0x00ffff, 20);
    spotLight.position.set(-5, 8, 0);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    let time = 0;
    const animate = () => {
      time += 0.01;
      brightSphere.position.y = 1 + Math.sin(time) * 0.5;
      darkSphere.position.y = 1 + Math.sin(time + Math.PI) * 0.5;
      midSphere.rotation.y += 0.01;

      // Animate color grading parameters
      gradePass.uniforms['contrast'].value = 1.0 + Math.sin(time * 0.5) * 0.3;
      gradePass.uniforms['saturation'].value = 1.0 + Math.cos(time * 0.3) * 0.4;

      composer.render();
      rafRef.current = requestAnimationFrame(animate);
    };
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
      sphereGeo.dispose();
      brightMat.dispose();
      darkMat.dispose();
      midMat.dispose();
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

export default T33_ToneMapping;
