import { useRef, useEffect } from 'react';
import * as THREE from 'three';

// IES-like profile texture generator
const createIESTexture = (): THREE.DataTexture => {
  const size = 256;
  const data = new Uint8Array(size * size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x / size) * 2 - 1;
      const v = (y / size) * 2 - 1;
      const dist = Math.sqrt(u * u + v * v);

      // IES-like distribution: bright center, sharp falloff, slight side lobes
      let intensity = Math.exp(-dist * dist * 4.0);
      // Add side lobes for realistic IES shape
      if (dist > 0.3 && dist < 0.6) {
        intensity += 0.15 * Math.exp(-Math.pow((dist - 0.45) / 0.1, 2));
      }
      intensity = Math.max(0, Math.min(1, intensity));
      data[y * size + x] = Math.floor(intensity * 255);
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RedFormat);
  texture.needsUpdate = true;
  return texture;
};

const iesVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const iesFragmentShader = `
  uniform sampler2D iesProfile;
  uniform vec3 lightColor;
  uniform float lightIntensity;
  uniform vec3 lightPosition;
  uniform vec3 lightDirection;
  uniform float coneAngle;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  void main() {
    vec3 toLight = lightPosition - vWorldPosition;
    float dist = length(toLight);
    vec3 toLightDir = normalize(toLight);
    vec3 lDir = normalize(lightDirection);

    // Angle from light center axis
    float cosTheta = dot(toLightDir, lDir);
    float angle = acos(clamp(cosTheta, -1.0, 1.0));

    // Map angle to texture coordinates
    float texU = (cosTheta + 1.0) * 0.5;
    float texV = 0.5;

    // Sample IES profile
    float iesFactor = texture2D(iesProfile, vec2(texU, texV)).r;

    // Distance attenuation
    float atten = 1.0 / (1.0 + 0.1 * dist + 0.01 * dist * dist);

    // Cone falloff
    float coneFalloff = smoothstep(coneAngle, coneAngle * 0.3, angle);

    float intensity = iesFactor * atten * coneFalloff * lightIntensity;

    vec3 color = lightColor * intensity;
    float alpha = intensity * 0.5;

    gl_FragColor = vec4(color, alpha);
  }
`;

const T17_IESLight: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Wall
    const wallGeometry = new THREE.PlaneGeometry(20, 10);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(0, 3, -5);
    wall.receiveShadow = true;
    scene.add(wall);

    // Objects to illuminate
    const sphereGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      roughness: 0.3,
      metalness: 0.5,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(0, -0.2, 0);
    sphere.castShadow = true;
    scene.add(sphere);

    const boxGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(-3, -1.25, 1);
    box.castShadow = true;
    scene.add(box);

    const cylGeo = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
    const cylMat = new THREE.MeshStandardMaterial({ color: 0x999999 });
    const cylinder = new THREE.Mesh(cylGeo, cylMat);
    cylinder.position.set(3, -1, 0);
    cylinder.castShadow = true;
    scene.add(cylinder);

    // IES Profile texture
    const iesTexture = createIESTexture();

    // Light source with IES profile
    const lightPosition = new THREE.Vector3(0, 6, 0);
    const lightDirection = new THREE.Vector3(0, -1, 0);

    // Actual spotlight
    const spotLight = new THREE.SpotLight(0xffeedd, 2);
    spotLight.position.copy(lightPosition);
    spotLight.target.position.set(0, -2, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.3;
    spotLight.castShadow = true;
    scene.add(spotLight);
    scene.add(spotLight.target);

    // IES visualization cone
    const iesConeGeo = new THREE.ConeGeometry(4, 8, 64, 1, true);
    const iesConeMat = new THREE.ShaderMaterial({
      vertexShader: iesVertexShader,
      fragmentShader: iesFragmentShader,
      uniforms: {
        iesProfile: { value: iesTexture },
        lightColor: { value: new THREE.Color(0xffeedd) },
        lightIntensity: { value: 2.0 },
        lightPosition: { value: lightPosition },
        lightDirection: { value: lightDirection },
        coneAngle: { value: Math.PI / 4 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const iesCone = new THREE.Mesh(iesConeGeo, iesConeMat);
    iesCone.position.copy(lightPosition);
    iesCone.position.y -= 4;
    scene.add(iesCone);

    // Second IES light (narrow beam)
    const light2Pos = new THREE.Vector3(-4, 5, 2);
    const light2Dir = new THREE.Vector3(0.3, -1, -0.2).normalize();
    const spotLight2 = new THREE.SpotLight(0xaaddff, 1.5);
    spotLight2.position.copy(light2Pos);
    spotLight2.target.position.set(-3, -2, 0);
    spotLight2.angle = Math.PI / 8;
    spotLight2.penumbra = 0.2;
    scene.add(spotLight2);
    scene.add(spotLight2.target);

    const iesCone2Geo = new THREE.ConeGeometry(2, 6, 64, 1, true);
    const iesCone2Mat = new THREE.ShaderMaterial({
      vertexShader: iesVertexShader,
      fragmentShader: iesFragmentShader,
      uniforms: {
        iesProfile: { value: iesTexture },
        lightColor: { value: new THREE.Color(0xaaddff) },
        lightIntensity: { value: 1.5 },
        lightPosition: { value: light2Pos },
        lightDirection: { value: light2Dir },
        coneAngle: { value: Math.PI / 8 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const iesCone2 = new THREE.Mesh(iesCone2Geo, iesCone2Mat);
    iesCone2.position.copy(light2Pos);
    iesCone2.position.add(light2Dir.clone().multiplyScalar(-3));
    iesCone2.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, -1, 0),
      light2Dir
    );
    scene.add(iesCone2);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x222222, 0.3);
    scene.add(ambientLight);

    const clock = new THREE.Clock();
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Animate main light
      const mainX = Math.sin(elapsed * 0.3) * 2;
      spotLight.position.x = mainX;
      iesCone.position.x = mainX;
      iesConeMat.uniforms.lightPosition.value.set(mainX, 6, 0);

      // Animate secondary light
      const angle2 = elapsed * 0.5;
      light2Pos.x = Math.cos(angle2) * 4;
      light2Pos.z = Math.sin(angle2) * 4;
      spotLight2.position.copy(light2Pos);
      iesCone2.position.copy(light2Pos);
      iesCone2.position.add(light2Dir.clone().multiplyScalar(-3));
      iesCone2Mat.uniforms.lightPosition.value.copy(light2Pos);

      // Rotate objects slightly
      sphere.rotation.y = elapsed * 0.2;
      box.rotation.y = elapsed * 0.15;
      cylinder.rotation.y = elapsed * 0.1;

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
      groundGeometry.dispose();
      groundMaterial.dispose();
      wallGeometry.dispose();
      wallMaterial.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      boxGeo.dispose();
      boxMat.dispose();
      cylGeo.dispose();
      cylMat.dispose();
      iesConeGeo.dispose();
      iesConeMat.dispose();
      iesCone2Geo.dispose();
      iesCone2Mat.dispose();
      iesTexture.dispose();
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

export default T17_IESLight;
