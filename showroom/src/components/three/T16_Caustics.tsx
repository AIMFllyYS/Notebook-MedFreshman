import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const causticsVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const causticsFragmentShader = `
  uniform float time;
  uniform vec3 waterColor;
  uniform float intensity;
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  // Simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
      + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vWorldPosition.xz * 0.5;
    float t = time * 0.5;

    // Multiple layers of noise for caustic patterns
    float caustic = 0.0;
    caustic += snoise(uv * 3.0 + t) * 0.5;
    caustic += snoise(uv * 6.0 - t * 0.7) * 0.25;
    caustic += snoise(uv * 12.0 + t * 1.3) * 0.125;

    // Sharpen the pattern
    caustic = pow(abs(caustic), 2.0);
    caustic = smoothstep(0.1, 0.8, caustic);

    vec3 color = waterColor * (0.3 + caustic * intensity);
    float alpha = 0.4 + caustic * 0.4;

    gl_FragColor = vec4(color, alpha);
  }
`;

const waterVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  uniform float time;

  void main() {
    vUv = uv;
    vec3 pos = position;
    // Gentle wave
    pos.y += sin(pos.x * 2.0 + time) * 0.1;
    pos.y += cos(pos.z * 1.5 + time * 0.8) * 0.1;
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const waterFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  uniform vec3 waterColor;
  uniform float time;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
    vec3 color = mix(waterColor * 0.5, waterColor * 1.2, fresnel);
    gl_FragColor = vec4(color, 0.7);
  }
`;

const T16_Caustics: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x001e36);
    scene.fog = new THREE.FogExp2(0x001e36, 0.05);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 5, 10);
    camera.lookAt(0, -2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Pool floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.9,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -4;
    floor.receiveShadow = true;
    scene.add(floor);

    // Caustics projection plane (above floor)
    const causticsGeometry = new THREE.PlaneGeometry(18, 18);
    const causticsMaterial = new THREE.ShaderMaterial({
      vertexShader: causticsVertexShader,
      fragmentShader: causticsFragmentShader,
      uniforms: {
        time: { value: 0 },
        waterColor: { value: new THREE.Color(0x00ffff) },
        intensity: { value: 1.2 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const causticsPlane = new THREE.Mesh(causticsGeometry, causticsMaterial);
    causticsPlane.rotation.x = -Math.PI / 2;
    causticsPlane.position.y = -3.9;
    scene.add(causticsPlane);

    // Water surface
    const waterGeometry = new THREE.PlaneGeometry(20, 20, 64, 64);
    const waterMaterial = new THREE.ShaderMaterial({
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      uniforms: {
        time: { value: 0 },
        waterColor: { value: new THREE.Color(0x006994) },
      },
      transparent: true,
      side: THREE.DoubleSide,
    });
    const waterSurface = new THREE.Mesh(waterGeometry, waterMaterial);
    waterSurface.rotation.x = -Math.PI / 2;
    waterSurface.position.y = 0;
    scene.add(waterSurface);

    // Underwater objects
    const rockGeo = new THREE.DodecahedronGeometry(0.8, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
    for (let i = 0; i < 6; i++) {
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(
        (Math.random() - 0.5) * 8,
        -3.5,
        (Math.random() - 0.5) * 8
      );
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      rock.scale.setScalar(0.5 + Math.random() * 0.8);
      scene.add(rock);
    }

    // Bubbles
    const bubbleCount = 100;
    const bubbleGeo = new THREE.BufferGeometry();
    const bubblePositions = new Float32Array(bubbleCount * 3);
    const bubbleSpeeds = new Float32Array(bubbleCount);
    for (let i = 0; i < bubbleCount; i++) {
      bubblePositions[i * 3] = (Math.random() - 0.5) * 10;
      bubblePositions[i * 3 + 1] = Math.random() * -4;
      bubblePositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      bubbleSpeeds[i] = 0.5 + Math.random() * 1.5;
    }
    bubbleGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(bubblePositions, 3)
    );
    const bubbleMat = new THREE.PointsMaterial({
      color: 0xaaddff,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
    });
    const bubbles = new THREE.Points(bubbleGeo, bubbleMat);
    scene.add(bubbles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x004466, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(5, 10, 5);
    scene.add(sunLight);

    const clock = new THREE.Clock();
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Update caustics
      causticsMaterial.uniforms.time.value = elapsed;
      waterMaterial.uniforms.time.value = elapsed;

      // Animate bubbles
      const positions = bubbleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < bubbleCount; i++) {
        positions[i * 3 + 1] += bubbleSpeeds[i] * 0.01;
        if (positions[i * 3 + 1] > 0) {
          positions[i * 3 + 1] = -4;
          positions[i * 3] = (Math.random() - 0.5) * 10;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
      }
      bubbleGeo.attributes.position.needsUpdate = true;

      // Gentle camera movement
      camera.position.x = Math.sin(elapsed * 0.1) * 2;
      camera.lookAt(0, -2, 0);

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
      floorGeometry.dispose();
      floorMaterial.dispose();
      causticsGeometry.dispose();
      causticsMaterial.dispose();
      waterGeometry.dispose();
      waterMaterial.dispose();
      rockGeo.dispose();
      rockMat.dispose();
      bubbleGeo.dispose();
      bubbleMat.dispose();
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

export default T16_Caustics;
