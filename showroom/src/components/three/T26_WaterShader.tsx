import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const vertexShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vElevation;

  void main() {
    vUv = uv;
    vec3 pos = position;

    float wave1 = sin(pos.x * 0.5 + uTime * 1.5) * 0.8;
    float wave2 = sin(pos.y * 0.4 + uTime * 1.2) * 0.6;
    float wave3 = sin((pos.x + pos.y) * 0.3 + uTime * 0.8) * 0.4;
    float elevation = wave1 + wave2 + wave3;

    pos.z += elevation;
    vElevation = elevation;

    // Approximate normal
    float dx = cos(pos.x * 0.5 + uTime * 1.5) * 0.5 * 0.8 + cos((pos.x + pos.y) * 0.3 + uTime * 0.8) * 0.3 * 0.4;
    float dy = cos(pos.y * 0.4 + uTime * 1.2) * 0.4 * 0.6 + cos((pos.x + pos.y) * 0.3 + uTime * 0.8) * 0.3 * 0.4;
    vNormal = normalize(vec3(-dx, -dy, 1.0));
    vPosition = (modelMatrix * vec4(pos, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColorDeep;
  uniform vec3 uColorShallow;
  uniform vec3 uCameraPosition;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vElevation;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(uCameraPosition - vPosition);

    // Fresnel
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

    // Color mixing based on elevation
    float mixFactor = smoothstep(-1.5, 1.5, vElevation);
    vec3 waterColor = mix(uColorDeep, uColorShallow, mixFactor);

    // Specular
    vec3 lightDir = normalize(vec3(1.0, 1.0, 2.0));
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 64.0);
    vec3 specular = vec3(1.0) * spec * 0.6;

    vec3 finalColor = waterColor + vec3(fresnel * 0.4) + specular;
    gl_FragColor = vec4(finalColor, 0.85 + fresnel * 0.15);
  }
`;

const T26_WaterShader: React.FC = () => {
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
    scene.background = new THREE.Color(0x0a1a2a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, -15, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Water plane
    const geometry = new THREE.PlaneGeometry(40, 40, 128, 128);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorDeep: { value: new THREE.Color(0x001e4d) },
        uColorShallow: { value: new THREE.Color(0x00a8cc) },
        uCameraPosition: { value: camera.position },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });
    materialRef.current = material;

    const water = new THREE.Mesh(geometry, material);
    water.rotation.x = -Math.PI * 0.35;
    scene.add(water);

    // Underwater floor
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshBasicMaterial({ color: 0x051020 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -5;
    scene.add(floor);

    // Animation
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;
      const t = timeRef.current;

      material.uniforms.uTime.value = t;
      material.uniforms.uCameraPosition.value.copy(camera.position);

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
      floorGeo.dispose();
      floorMat.dispose();
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

export default T26_WaterShader;
