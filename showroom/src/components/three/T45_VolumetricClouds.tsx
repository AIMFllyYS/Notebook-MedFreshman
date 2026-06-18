import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
varying vec3 vWorldPosition;
void main() {
  vUv = uv;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

varying vec2 vUv;
varying vec3 vWorldPosition;

uniform float uTime;
uniform vec3 uCameraPosition;

// Simplex 3D noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}

float sampleDensity(vec3 p) {
  vec3 wp = p + vec3(uTime * 0.5, uTime * 0.1, uTime * 0.3);
  float shape = fbm(wp * 0.3);
  float detail = fbm(wp * 0.8 + vec3(100.0));
  float density = shape * 0.5 + detail * 0.25;
  // Height falloff
  float height = p.y;
  density *= smoothstep(-3.0, 0.0, height) * smoothstep(4.0, 1.0, height);
  return max(density - 0.2, 0.0);
}

void main() {
  vec3 rayOrigin = uCameraPosition;
  vec3 rayDir = normalize(vWorldPosition - rayOrigin);
  
  float tMin = 0.1;
  float tMax = 30.0;
  float stepSize = 0.3;
  
  vec3 color = vec3(0.4, 0.6, 0.9); // Sky blue
  float transmittance = 1.0;
  vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
  vec3 lightColor = vec3(1.0, 0.95, 0.8);
  vec3 cloudColor = vec3(1.0, 1.0, 1.0);
  vec3 ambientColor = vec3(0.3, 0.4, 0.6);
  
  float t = tMin;
  for (int i = 0; i < 64; i++) {
    if (t > tMax || transmittance < 0.01) break;
    vec3 p = rayOrigin + rayDir * t;
    float density = sampleDensity(p);
    
    if (density > 0.001) {
      // Light marching
      float lightDensity = 0.0;
      float tLight = 0.1;
      for (int j = 0; j < 8; j++) {
        vec3 pLight = p + lightDir * tLight;
        lightDensity += sampleDensity(pLight);
        tLight += 0.3;
      }
      float lightTransmittance = exp(-lightDensity * 0.5);
      
      vec3 scattering = cloudColor * lightColor * lightTransmittance + ambientColor * (1.0 - lightTransmittance);
      float absorption = density * stepSize * 0.5;
      transmittance *= exp(-absorption);
      color = mix(color, scattering, (1.0 - exp(-absorption)) * transmittance);
    }
    
    t += stepSize;
  }
  
  // Horizon gradient
  float horizon = 1.0 - abs(vUv.y - 0.5) * 2.0;
  color = mix(vec3(0.6, 0.7, 0.9), color, 0.5 + horizon * 0.5);
  
  gl_FragColor = vec4(color, 1.0);
}
`;

export default function T45_VolumetricClouds() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rafRef = useRef<number>(0);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1, 5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Fullscreen quad for ray marching
    const quadGeo = new THREE.PlaneGeometry(2, 2);
    const quadMat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uCameraPosition: { value: camera.position },
      },
      depthWrite: false,
      depthTest: false,
    });
    const quad = new THREE.Mesh(quadGeo, quadMat);
    scene.add(quad);
    materialRef.current = quadMat;

    // Sun
    const sunGeo = new THREE.SphereGeometry(2, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff5e1 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(15, 10, -20);
    scene.add(sun);

    // Terrain silhouette
    const terrainGeo = new THREE.PlaneGeometry(60, 40, 32, 32);
    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = Math.sin(x * 0.2) * 2 + Math.cos(y * 0.15) * 1.5 + Math.sin(x * 0.5 + y * 0.3) * 0.5;
      posAttr.setZ(i, z);
    }
    terrainGeo.computeVertexNormals();
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x2d5016,
      roughness: 0.9,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -3;
    scene.add(terrain);

    function animate() {
      rafRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;
      const t = timeRef.current;

      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = t;
        materialRef.current.uniforms.uCameraPosition.value.copy(camera.position);
      }

      camera.position.x = Math.sin(t * 0.1) * 2;
      camera.position.z = 5 + Math.cos(t * 0.1) * 1;
      camera.lookAt(0, 1, 0);

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
      quadGeo.dispose();
      quadMat.dispose();
      sunGeo.dispose();
      sunMat.dispose();
      terrainGeo.dispose();
      terrainMat.dispose();
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
