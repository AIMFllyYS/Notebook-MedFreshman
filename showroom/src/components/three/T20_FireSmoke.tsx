import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const fireVertexShader = `
  attribute float size;
  attribute float life;
  attribute float maxLife;
  varying float vLife;
  varying float vMaxLife;
  varying vec2 vUv;
  void main() {
    vLife = life;
    vMaxLife = maxLife;
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fireFragmentShader = `
  uniform float time;
  varying float vLife;
  varying float vMaxLife;
  varying vec2 vUv;

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
    float lifeRatio = vLife / vMaxLife;
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // Noise for flame detail
    float noise = snoise(gl_PointCoord * 5.0 + time * 2.0) * 0.5 + 0.5;

    // Fire colors: white -> yellow -> orange -> red -> dark
    vec3 color;
    float alpha;
    if (lifeRatio < 0.2) {
      color = mix(vec3(1.0, 1.0, 0.8), vec3(1.0, 0.9, 0.0), lifeRatio / 0.2);
      alpha = 1.0;
    } else if (lifeRatio < 0.5) {
      color = mix(vec3(1.0, 0.9, 0.0), vec3(1.0, 0.5, 0.0), (lifeRatio - 0.2) / 0.3);
      alpha = 1.0 - (lifeRatio - 0.2) / 0.3 * 0.3;
    } else if (lifeRatio < 0.8) {
      color = mix(vec3(1.0, 0.5, 0.0), vec3(0.8, 0.1, 0.0), (lifeRatio - 0.5) / 0.3);
      alpha = 0.7 - (lifeRatio - 0.5) / 0.3 * 0.4;
    } else {
      color = mix(vec3(0.8, 0.1, 0.0), vec3(0.2, 0.2, 0.2), (lifeRatio - 0.8) / 0.2);
      alpha = 0.3 - (lifeRatio - 0.8) / 0.2 * 0.3;
    }

    // Soft edge
    float edge = 1.0 - smoothstep(0.3, 0.5, dist);
    alpha *= edge * noise;

    gl_FragColor = vec4(color, max(0.0, alpha));
  }
`;

const smokeVertexShader = `
  attribute float size;
  attribute float life;
  attribute float maxLife;
  varying float vLife;
  varying float vMaxLife;
  void main() {
    vLife = life;
    vMaxLife = maxLife;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (400.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const smokeFragmentShader = `
  varying float vLife;
  varying float vMaxLife;
  void main() {
    float lifeRatio = vLife / vMaxLife;
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // Smoke: dark gray to transparent
    float gray = 0.3 - lifeRatio * 0.2;
    float alpha = (1.0 - lifeRatio) * 0.4;
    float edge = 1.0 - smoothstep(0.2, 0.5, dist);
    alpha *= edge;

    gl_FragColor = vec4(vec3(gray), alpha);
  }
`;

interface ParticleData {
  positions: Float32Array;
  velocities: Float32Array;
  lives: Float32Array;
  maxLives: Float32Array;
  sizes: Float32Array;
}

const T20_FireSmoke: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Logs
    const logGeo = new THREE.CylinderGeometry(0.15, 0.15, 2, 16);
    const logMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
    for (let i = 0; i < 4; i++) {
      const log = new THREE.Mesh(logGeo, logMat);
      log.position.set(
        Math.cos((i / 4) * Math.PI * 2) * 0.5,
        0,
        Math.sin((i / 4) * Math.PI * 2) * 0.5
      );
      log.rotation.z = Math.PI / 2;
      log.rotation.y = (i / 4) * Math.PI * 2;
      scene.add(log);
    }

    // Fire particles
    const fireCount = 2000;
    const fireGeo = new THREE.BufferGeometry();
    const fireData: ParticleData = {
      positions: new Float32Array(fireCount * 3),
      velocities: new Float32Array(fireCount * 3),
      lives: new Float32Array(fireCount),
      maxLives: new Float32Array(fireCount),
      sizes: new Float32Array(fireCount),
    };

    for (let i = 0; i < fireCount; i++) {
      resetFireParticle(fireData, i, true);
    }

    fireGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(fireData.positions, 3)
    );
    fireGeo.setAttribute(
      'life',
      new THREE.BufferAttribute(fireData.lives, 1)
    );
    fireGeo.setAttribute(
      'maxLife',
      new THREE.BufferAttribute(fireData.maxLives, 1)
    );
    fireGeo.setAttribute(
      'size',
      new THREE.BufferAttribute(fireData.sizes, 1)
    );

    const fireUniforms = {
      time: { value: 0 },
    };

    const fireMaterial = new THREE.ShaderMaterial({
      vertexShader: fireVertexShader,
      fragmentShader: fireFragmentShader,
      uniforms: fireUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const fireSystem = new THREE.Points(fireGeo, fireMaterial);
    scene.add(fireSystem);

    // Smoke particles
    const smokeCount = 800;
    const smokeGeo = new THREE.BufferGeometry();
    const smokeData: ParticleData = {
      positions: new Float32Array(smokeCount * 3),
      velocities: new Float32Array(smokeCount * 3),
      lives: new Float32Array(smokeCount),
      maxLives: new Float32Array(smokeCount),
      sizes: new Float32Array(smokeCount),
    };

    for (let i = 0; i < smokeCount; i++) {
      resetSmokeParticle(smokeData, i, true);
    }

    smokeGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(smokeData.positions, 3)
    );
    smokeGeo.setAttribute(
      'life',
      new THREE.BufferAttribute(smokeData.lives, 1)
    );
    smokeGeo.setAttribute(
      'maxLife',
      new THREE.BufferAttribute(smokeData.maxLives, 1)
    );
    smokeGeo.setAttribute(
      'size',
      new THREE.BufferAttribute(smokeData.sizes, 1)
    );

    const smokeMaterial = new THREE.ShaderMaterial({
      vertexShader: smokeVertexShader,
      fragmentShader: smokeFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const smokeSystem = new THREE.Points(smokeGeo, smokeMaterial);
    scene.add(smokeSystem);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x111111, 0.3);
    scene.add(ambientLight);

    // Fire light (flickering)
    const fireLight = new THREE.PointLight(0xff6600, 2, 15);
    fireLight.position.set(0, 1, 0);
    fireLight.castShadow = true;
    scene.add(fireLight);

    const clock = new THREE.Clock();
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();

      fireUniforms.time.value = elapsed;

      // Update fire particles
      for (let i = 0; i < fireCount; i++) {
        fireData.lives[i] += delta;
        if (fireData.lives[i] >= fireData.maxLives[i]) {
          resetFireParticle(fireData, i, false);
        } else {
          fireData.positions[i * 3] +=
            fireData.velocities[i * 3] + Math.sin(elapsed * 3 + i) * 0.002;
          fireData.positions[i * 3 + 1] += fireData.velocities[i * 3 + 1];
          fireData.positions[i * 3 + 2] +=
            fireData.velocities[i * 3 + 2] + Math.cos(elapsed * 2 + i) * 0.002;
        }
      }
      fireGeo.attributes.position.needsUpdate = true;
      fireGeo.attributes.life.needsUpdate = true;

      // Update smoke particles
      for (let i = 0; i < smokeCount; i++) {
        smokeData.lives[i] += delta;
        if (smokeData.lives[i] >= smokeData.maxLives[i]) {
          resetSmokeParticle(smokeData, i, false);
        } else {
          smokeData.positions[i * 3] +=
            smokeData.velocities[i * 3] + Math.sin(elapsed + i * 0.1) * 0.001;
          smokeData.positions[i * 3 + 1] += smokeData.velocities[i * 3 + 1];
          smokeData.positions[i * 3 + 2] +=
            smokeData.velocities[i * 3 + 2] + Math.cos(elapsed + i * 0.1) * 0.001;
          // Expand as it rises
          smokeData.sizes[i] += delta * 0.5;
        }
      }
      smokeGeo.attributes.position.needsUpdate = true;
      smokeGeo.attributes.life.needsUpdate = true;
      smokeGeo.attributes.size.needsUpdate = true;

      // Flicker fire light
      fireLight.intensity = 1.5 + Math.sin(elapsed * 10) * 0.3 + Math.sin(elapsed * 23) * 0.2;
      fireLight.color.setHSL(0.08 + Math.sin(elapsed * 5) * 0.02, 1, 0.5);

      renderer.render(scene, camera);
    };
    animate();

    function resetFireParticle(data: ParticleData, i: number, initial: boolean) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.5;
      data.positions[i * 3] = Math.cos(angle) * radius;
      data.positions[i * 3 + 1] = initial ? Math.random() * 2 : 0;
      data.positions[i * 3 + 2] = Math.sin(angle) * radius;

      data.velocities[i * 3] = (Math.random() - 0.5) * 0.01;
      data.velocities[i * 3 + 1] = 0.02 + Math.random() * 0.04;
      data.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;

      data.lives[i] = 0;
      data.maxLives[i] = 0.5 + Math.random() * 1.0;
      data.sizes[i] = 0.5 + Math.random() * 1.0;
    }

    function resetSmokeParticle(data: ParticleData, i: number, initial: boolean) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.3;
      data.positions[i * 3] = Math.cos(angle) * radius;
      data.positions[i * 3 + 1] = initial ? Math.random() * 3 : 0.5;
      data.positions[i * 3 + 2] = Math.sin(angle) * radius;

      data.velocities[i * 3] = (Math.random() - 0.5) * 0.005;
      data.velocities[i * 3 + 1] = 0.01 + Math.random() * 0.02;
      data.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.005;

      data.lives[i] = 0;
      data.maxLives[i] = 2.0 + Math.random() * 2.0;
      data.sizes[i] = 1.0 + Math.random() * 1.0;
    }

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
      groundGeometry.dispose();
      groundMaterial.dispose();
      logGeo.dispose();
      logMat.dispose();
      fireGeo.dispose();
      fireMaterial.dispose();
      smokeGeo.dispose();
      smokeMaterial.dispose();
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

export default T20_FireSmoke;
