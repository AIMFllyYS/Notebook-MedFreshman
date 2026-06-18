import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const sssVertexShader = `
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const sssFragmentShader = `
precision highp float;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec2 vUv;

uniform vec3 uColor;
uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform float uThickness;
uniform float uWrap;
uniform float uPower;
uniform float uDistortion;
uniform float uAmbient;
uniform float uTime;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  vec3 lightDir = normalize(uLightPosition - vWorldPosition);
  
  // Wrap lighting for SSS
  float NdotL = dot(normal, lightDir);
  float wrap = (NdotL + uWrap) / (1.0 + uWrap);
  wrap = max(wrap, 0.0);
  
  // Thickness variation based on view angle
  float VdotN = abs(dot(viewDir, normal));
  float thickness = uThickness * (1.0 - VdotN * uDistortion);
  
  // Subsurface color
  vec3 subsurfaceColor = uColor * 1.5;
  vec3 subsurface = subsurfaceColor * pow(wrap, uPower) * thickness;
  
  // Backlighting effect
  float backLight = max(dot(-normal, lightDir), 0.0);
  vec3 backScatter = subsurfaceColor * backLight * uThickness * 0.5;
  
  // Ambient
  vec3 ambient = uColor * uAmbient;
  
  // Specular
  vec3 halfDir = normalize(lightDir + viewDir);
  float specAngle = max(dot(normal, halfDir), 0.0);
  float specular = pow(specAngle, 32.0) * 0.3;
  
  // Combine
  vec3 diffuse = uColor * wrap * uLightColor;
  vec3 finalColor = ambient + diffuse + subsurface + backScatter + vec3(specular);
  
  // Add some translucency variation
  float noise = hash(vUv * 10.0 + uTime * 0.1);
  finalColor += subsurfaceColor * noise * 0.05 * thickness;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default function T48_SubsurfaceScattering() {
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
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0x404060, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(3, 5, 3);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xff8844, 0.8, 20);
    pointLight.position.set(-3, 2, -3);
    scene.add(pointLight);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // SSS Objects
    const sssMaterial = new THREE.ShaderMaterial({
      vertexShader: sssVertexShader,
      fragmentShader: sssFragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color(0xff6b6b) },
        uLightPosition: { value: dirLight.position },
        uLightColor: { value: new THREE.Color(0xffffff) },
        uThickness: { value: 0.8 },
        uWrap: { value: 0.5 },
        uPower: { value: 2.0 },
        uDistortion: { value: 0.8 },
        uAmbient: { value: 0.2 },
        uTime: { value: 0 },
      },
    });
    materialRef.current = sssMaterial;

    // Main jelly-like sphere
    const sphereGeo = new THREE.SphereGeometry(1, 64, 64);
    const sphere = new THREE.Mesh(sphereGeo, sssMaterial);
    sphere.position.set(0, 0, 0);
    sphere.castShadow = true;
    scene.add(sphere);

    // Additional objects with different colors
    const colors = [0x4ecdc4, 0xffe66d, 0xa8e6cf];
    const positions = [
      new THREE.Vector3(-2.5, -0.5, 0.5),
      new THREE.Vector3(2.5, -0.5, -0.5),
      new THREE.Vector3(0, -0.5, -2),
    ];

    for (let i = 0; i < 3; i++) {
      const geo = new THREE.SphereGeometry(0.6, 48, 48);
      const mat = sssMaterial.clone();
      mat.uniforms.uColor.value = new THREE.Color(colors[i]);
      mat.uniforms.uThickness.value = 0.6 + i * 0.2;
      mat.uniforms.uWrap.value = 0.3 + i * 0.2;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(positions[i]);
      mesh.castShadow = true;
      scene.add(mesh);
    }

    // Backlight plane to show translucency
    const backPlaneGeo = new THREE.PlaneGeometry(8, 6);
    const backPlaneMat = new THREE.MeshBasicMaterial({
      color: 0xffaa44,
      side: THREE.DoubleSide,
    });
    const backPlane = new THREE.Mesh(backPlaneGeo, backPlaneMat);
    backPlane.position.set(0, 0, -4);
    scene.add(backPlane);

    function animate() {
      rafRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;
      const t = timeRef.current;

      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = t;
      }

      // Animate light
      dirLight.position.x = Math.sin(t * 0.5) * 4;
      dirLight.position.z = Math.cos(t * 0.5) * 4;

      // Animate back plane intensity
      const intensity = 0.5 + Math.sin(t * 2) * 0.3;
      backPlaneMat.color.setRGB(1.0 * intensity, 0.65 * intensity, 0.25 * intensity);

      camera.position.x = Math.sin(t * 0.2) * 5;
      camera.position.z = Math.cos(t * 0.2) * 5;
      camera.lookAt(0, 0, 0);

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
      sphereGeo.dispose();
      sssMaterial.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      backPlaneGeo.dispose();
      backPlaneMat.dispose();
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
