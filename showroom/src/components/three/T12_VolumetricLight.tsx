import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = `
  uniform vec3 lightPosition;
  uniform vec3 lightColor;
  uniform float intensity;
  uniform float decay;
  uniform float time;
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  // Simplex noise function
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

  void main() {
    vec3 toLight = lightPosition - vWorldPosition;
    float dist = length(toLight);
    vec3 lightDir = normalize(toLight);

    // Cone attenuation
    vec3 coneDir = normalize(vec3(0.0, -1.0, 0.0));
    float coneDot = dot(lightDir, coneDir);
    float coneAngle = 0.7;
    float coneAtten = smoothstep(coneAngle, 1.0, coneDot);

    // Distance attenuation
    float atten = 1.0 / (1.0 + decay * dist * dist);

    // Noise for dust/mist effect
    float noise = snoise(vWorldPosition * 0.5 + time * 0.1) * 0.5 + 0.5;
    noise *= snoise(vWorldPosition * 1.0 - time * 0.2) * 0.5 + 0.5;

    float alpha = coneAtten * atten * intensity * noise;

    gl_FragColor = vec4(lightColor, alpha);
  }
`;

const T12_VolumetricLight: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.02);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Ground with grid
    const groundGeometry = new THREE.PlaneGeometry(40, 40);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper
    const gridHelper = new THREE.GridHelper(40, 40, 0x333355, 0x222233);
    gridHelper.position.y = -1.99;
    scene.add(gridHelper);

    // Objects in scene
    const boxGeometry = new THREE.BoxGeometry(1, 2, 1);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x445566 });
    const box1 = new THREE.Mesh(boxGeometry, boxMaterial);
    box1.position.set(-3, -1, -2);
    box1.castShadow = true;
    scene.add(box1);

    const box2 = new THREE.Mesh(boxGeometry, boxMaterial);
    box2.position.set(3, -1, -3);
    box2.castShadow = true;
    scene.add(box2);

    const sphereGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x556677 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, -1.2, -1);
    sphere.castShadow = true;
    scene.add(sphere);

    // SpotLight (actual light source)
    const spotLight = new THREE.SpotLight(0xffddaa, 5, 30, Math.PI / 6, 0.5, 1);
    spotLight.position.set(0, 8, 0);
    spotLight.target.position.set(0, -2, 0);
    spotLight.castShadow = true;
    scene.add(spotLight);
    scene.add(spotLight.target);

    // Volumetric light cone mesh
    const coneGeometry = new THREE.ConeGeometry(4, 12, 32, 1, true);
    const coneMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        lightPosition: { value: new THREE.Vector3(0, 8, 0) },
        lightColor: { value: new THREE.Color(0xffddaa) },
        intensity: { value: 0.6 },
        decay: { value: 0.05 },
        time: { value: 0 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const lightCone = new THREE.Mesh(coneGeometry, coneMaterial);
    lightCone.position.set(0, 2, 0);
    scene.add(lightCone);

    // Secondary smaller volumetric cones for god rays effect
    const rayCount = 5;
    const rayCones: THREE.Mesh[] = [];
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const rayGeo = new THREE.ConeGeometry(1.5, 10, 16, 1, true);
      const rayMat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          lightPosition: { value: new THREE.Vector3(0, 8, 0) },
          lightColor: { value: new THREE.Color(0xffeedd) },
          intensity: { value: 0.2 },
          decay: { value: 0.08 },
          time: { value: 0 },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const ray = new THREE.Mesh(rayGeo, rayMat);
      ray.position.set(Math.cos(angle) * 2, 1.5, Math.sin(angle) * 2);
      ray.rotation.z = Math.cos(angle) * 0.2;
      ray.rotation.x = Math.sin(angle) * 0.2;
      scene.add(ray);
      rayCones.push(ray);
    }

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x111122, 0.5);
    scene.add(ambientLight);

    const clock = new THREE.Clock();
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Update shader uniforms
      coneMaterial.uniforms.time.value = elapsed;
      rayCones.forEach((ray, i) => {
        const mat = ray.material as THREE.ShaderMaterial;
        mat.uniforms.time.value = elapsed + i;
      });

      // Sway the light slightly
      spotLight.position.x = Math.sin(elapsed * 0.3) * 1;
      spotLight.position.z = Math.cos(elapsed * 0.3) * 1;
      coneMaterial.uniforms.lightPosition.value.copy(spotLight.position);
      lightCone.position.x = spotLight.position.x;
      lightCone.position.z = spotLight.position.z;

      // Rotate rays
      rayCones.forEach((ray, i) => {
        ray.rotation.y = elapsed * 0.1 + (i * Math.PI * 2) / rayCount;
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      renderer.dispose();
      coneGeometry.dispose();
      coneMaterial.dispose();
      groundGeometry.dispose();
      groundMaterial.dispose();
      boxGeometry.dispose();
      boxMaterial.dispose();
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      rayCones.forEach((ray) => {
        ray.geometry.dispose();
        (ray.material as THREE.ShaderMaterial).dispose();
      });
      if (container && renderer.domElement.parentNode === container) {
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

export default T12_VolumetricLight;
