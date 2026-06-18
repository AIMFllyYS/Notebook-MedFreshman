import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform sampler2D uDiffuseMap;
  uniform sampler2D uHeightMap;
  uniform float uHeightScale;
  uniform int uMaxSteps;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;

  vec2 parallaxOcclusionMapping(vec2 texCoords, vec3 viewDirTangent) {
    float layerDepth = 1.0 / float(uMaxSteps);
    float currentLayerDepth = 0.0;
    vec2 P = viewDirTangent.xy / viewDirTangent.z * uHeightScale;
    vec2 deltaTexCoords = P / float(uMaxSteps);

    vec2 currentTexCoords = texCoords;
    float currentDepthMapValue = texture2D(uHeightMap, currentTexCoords).r;

    for (int i = 0; i < 64; i++) {
      if (i >= uMaxSteps) break;
      if (currentLayerDepth >= currentDepthMapValue) break;
      currentTexCoords -= deltaTexCoords;
      currentDepthMapValue = texture2D(uHeightMap, currentTexCoords).r;
      currentLayerDepth += layerDepth;
    }

    // Interpolation before and after collision
    vec2 prevTexCoords = currentTexCoords + deltaTexCoords;
    float afterDepth = currentDepthMapValue - currentLayerDepth;
    float beforeDepth = texture2D(uHeightMap, prevTexCoords).r - currentLayerDepth + layerDepth;
    float weight = afterDepth / (afterDepth - beforeDepth);
    vec2 finalTexCoords = prevTexCoords * weight + currentTexCoords * (1.0 - weight);
    return finalTexCoords;
  }

  void main() {
    // Approximate tangent space view direction
    vec3 V = normalize(vViewPosition);
    vec3 N = normalize(vNormal);
    vec3 T = normalize(cross(N, vec3(0.0, 1.0, 0.0)));
    if (length(T) < 0.001) T = vec3(1.0, 0.0, 0.0);
    vec3 B = cross(N, T);
    mat3 TBN = mat3(T, B, N);
    vec3 viewDirTangent = normalize(inverse(TBN) * V);

    vec2 texCoords = parallaxOcclusionMapping(vUv, viewDirTangent);

    // Discard if out of bounds
    if (texCoords.x > 1.0 || texCoords.y > 1.0 || texCoords.x < 0.0 || texCoords.y < 0.0)
      discard;

    vec4 diffuseColor = texture2D(uDiffuseMap, texCoords);

    // Simple lighting
    vec3 lightDir = normalize(vec3(1.0, 1.0, 2.0));
    float diff = max(dot(N, lightDir), 0.0);
    vec3 ambient = vec3(0.2);
    vec3 finalColor = diffuseColor.rgb * (ambient + vec3(diff * 0.8));

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const T29_ParallaxOcclusion: React.FC = () => {
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
    scene.background = new THREE.Color(0x111111);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 3, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Procedural textures
    const size = 512;
    const diffuseCanvas = document.createElement('canvas');
    diffuseCanvas.width = size;
    diffuseCanvas.height = size;
    const dCtx = diffuseCanvas.getContext('2d')!;
    // Brick pattern
    dCtx.fillStyle = '#8B4513';
    dCtx.fillRect(0, 0, size, size);
    dCtx.fillStyle = '#A0522D';
    const brickW = 64;
    const brickH = 32;
    for (let y = 0; y < size; y += brickH) {
      const offset = ((y / brickH) % 2) * (brickW / 2);
      for (let x = -brickW; x < size; x += brickW) {
        dCtx.fillRect(x + offset + 2, y + 2, brickW - 4, brickH - 4);
      }
    }
    const diffuseTexture = new THREE.CanvasTexture(diffuseCanvas);
    diffuseTexture.wrapS = THREE.RepeatWrapping;
    diffuseTexture.wrapT = THREE.RepeatWrapping;

    const heightCanvas = document.createElement('canvas');
    heightCanvas.width = size;
    heightCanvas.height = size;
    const hCtx = heightCanvas.getContext('2d')!;
    hCtx.fillStyle = '#000000';
    hCtx.fillRect(0, 0, size, size);
    hCtx.fillStyle = '#FFFFFF';
    for (let y = 0; y < size; y += brickH) {
      const offset = ((y / brickH) % 2) * (brickW / 2);
      for (let x = -brickW; x < size; x += brickW) {
        hCtx.fillRect(x + offset + 2, y + 2, brickW - 4, brickH - 4);
      }
    }
    const heightTexture = new THREE.CanvasTexture(heightCanvas);
    heightTexture.wrapS = THREE.RepeatWrapping;
    heightTexture.wrapT = THREE.RepeatWrapping;

    // Plane with POM
    const geometry = new THREE.PlaneGeometry(8, 8, 128, 128);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uDiffuseMap: { value: diffuseTexture },
        uHeightMap: { value: heightTexture },
        uHeightScale: { value: 0.15 },
        uMaxSteps: { value: 32 },
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
    });
    materialRef.current = material;

    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    // Animation
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;
      const t = timeRef.current;

      // Orbit camera
      camera.position.x = Math.sin(t * 0.3) * 6;
      camera.position.z = Math.cos(t * 0.3) * 6;
      camera.lookAt(0, 0, 0);

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
      diffuseTexture.dispose();
      heightTexture.dispose();
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

export default T29_ParallaxOcclusion;
