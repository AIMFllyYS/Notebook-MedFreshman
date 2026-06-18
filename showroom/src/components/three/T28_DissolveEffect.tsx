import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uThreshold;
  uniform vec3 uEdgeColor;
  uniform vec3 uBaseColor;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  // Simple noise function
  float hash(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
    return n;
  }

  void main() {
    float n = noise(vPosition * 2.5 + uTime * 0.3);
    float dissolve = n - uThreshold;

    if (dissolve < 0.0) discard;

    float edgeWidth = 0.15;
    float edge = smoothstep(0.0, edgeWidth, dissolve);

    vec3 color = mix(uEdgeColor, uBaseColor, edge);
    float alpha = edge * 0.95 + 0.05;

    gl_FragColor = vec4(color, alpha);
  }
`;

const T28_DissolveEffect: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rafRef = useRef<number>(0);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 6);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Dissolve object
    const geometry = new THREE.TorusKnotGeometry(1.5, 0.5, 128, 32);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uThreshold: { value: -0.5 },
        uEdgeColor: { value: new THREE.Color(0xff4400) },
        uBaseColor: { value: new THREE.Color(0x333333) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Light for base color reference
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Animation
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;
      const t = timeRef.current;

      // Oscillate threshold for dissolve/reform cycle
      const threshold = Math.sin(t * 0.8) * 0.8 - 0.1;
      material.uniforms.uTime.value = t;
      material.uniforms.uThreshold.value = threshold;

      mesh.rotation.x = t * 0.2;
      mesh.rotation.y = t * 0.3;

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

export default T28_DissolveEffect;
