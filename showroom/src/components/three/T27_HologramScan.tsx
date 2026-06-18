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
  uniform float uScanLine;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    // Scanline
    float scan = smoothstep(uScanLine - 0.02, uScanLine, vPosition.y) *
                 smoothstep(uScanLine + 0.02, uScanLine, vPosition.y);

    // Horizontal scanlines
    float lines = sin(vPosition.y * 80.0 + uTime * 2.0) * 0.5 + 0.5;
    lines = pow(lines, 3.0) * 0.3 + 0.7;

    // Fresnel / rim
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.0);

    // RGB shift based on position
    float r = uColor.r * lines + fresnel * 0.5;
    float g = uColor.g * lines + fresnel * 0.3;
    float b = uColor.b * lines + fresnel * 0.8;

    vec3 color = vec3(r, g, b);
    color += vec3(0.5, 0.8, 1.0) * scan * 2.0;

    float alpha = 0.4 + fresnel * 0.4 + scan * 0.6;
    gl_FragColor = vec4(color, alpha);
  }
`;

const T27_HologramScan: React.FC = () => {
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
    scene.background = new THREE.Color(0x020205);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Hologram object (icosahedron)
    const geometry = new THREE.IcosahedronGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScanLine: { value: -3.0 },
        uColor: { value: new THREE.Color(0x00ffff) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    materialRef.current = material;

    const hologram = new THREE.Mesh(geometry, material);
    scene.add(hologram);

    // Wireframe overlay
    const wireGeo = new THREE.IcosahedronGeometry(2.05, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const wireframe = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireframe);

    // Grid floor
    const gridHelper = new THREE.GridHelper(20, 20, 0x004444, 0x002222);
    gridHelper.position.y = -3;
    scene.add(gridHelper);

    // Animation
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;
      const t = timeRef.current;

      // Scan line cycles up and down
      const scanLine = Math.sin(t * 1.5) * 3.0;
      material.uniforms.uTime.value = t;
      material.uniforms.uScanLine.value = scanLine;

      hologram.rotation.y = t * 0.3;
      hologram.rotation.x = Math.sin(t * 0.2) * 0.2;
      wireframe.rotation.copy(hologram.rotation);

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
      wireGeo.dispose();
      wireMat.dispose();
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

export default T27_HologramScan;
