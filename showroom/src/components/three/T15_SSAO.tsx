import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ssaoVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ssaoFragmentShader = `
  uniform sampler2D tDiffuse;
  uniform sampler2D tDepth;
  uniform vec2 resolution;
  uniform float cameraNear;
  uniform float cameraFar;
  uniform float radius;
  uniform float intensity;
  varying vec2 vUv;

  // Pseudo-random function
  float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float getDepth(vec2 uv) {
    float z = texture2D(tDepth, uv).x;
    return z;
  }

  float getLinearDepth(float z) {
    return (2.0 * cameraNear) / (cameraFar + cameraNear - z * (cameraFar - cameraNear));
  }

  vec3 getNormal(vec2 uv) {
    vec2 texel = 1.0 / resolution;
    float d0 = getLinearDepth(getDepth(uv));
    float dx = getLinearDepth(getDepth(uv + vec2(texel.x, 0.0)));
    float dy = getLinearDepth(getDepth(uv + vec2(0.0, texel.y)));
    vec3 normal = normalize(vec3(d0 - dx, d0 - dy, 0.01));
    return normal;
  }

  void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    float depth = getDepth(vUv);

    if (depth >= 1.0) {
      gl_FragColor = color;
      return;
    }

    float linearDepth = getLinearDepth(depth);
    vec2 texel = 1.0 / resolution;
    float occlusion = 0.0;
    int samples = 16;

    for (int i = 0; i < 16; i++) {
      float fi = float(i);
      float angle = fi * 2.39996; // golden angle
      float dist = (fi + 1.0) / 16.0 * radius;
      vec2 offset = vec2(cos(angle), sin(angle)) * dist * texel;
      float sampleDepth = getLinearDepth(getDepth(vUv + offset));
      float rangeCheck = smoothstep(0.0, 1.0, radius / abs(linearDepth - sampleDepth));
      occlusion += (sampleDepth < linearDepth - 0.001 ? 1.0 : 0.0) * rangeCheck;
    }

    occlusion = 1.0 - (occlusion / float(samples)) * intensity;
    occlusion = clamp(occlusion, 0.0, 1.0);

    vec3 aoColor = color.rgb * occlusion;
    gl_FragColor = vec4(aoColor, color.a);
  }
`;

const T15_SSAO: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xaaaaaa);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(5, 5, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Create complex scene with occluding geometry
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });

    // Wall of boxes
    for (let x = -3; x <= 3; x++) {
      for (let y = 0; y <= 3; y++) {
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.position.set(x * 1.1, y * 1.1 - 1, 0);
        box.castShadow = true;
        box.receiveShadow = true;
        scene.add(box);
      }
    }

    // Ground
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.6;
    ground.receiveShadow = true;
    scene.add(ground);

    // Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.5, 0.5, 4, 32);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x999999 });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(2, 0.4, -2);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    scene.add(pillar);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Post-processing setup using custom SSAO shader
    const renderTarget = new THREE.WebGLRenderTarget(
      container.clientWidth,
      container.clientHeight
    );
    renderTarget.texture.minFilter = THREE.LinearFilter;
    renderTarget.texture.magFilter = THREE.LinearFilter;
    renderTarget.depthTexture = new THREE.DepthTexture(
      container.clientWidth,
      container.clientHeight
    );
    renderTarget.depthTexture.type = THREE.UnsignedShortType;

    const ssaoUniforms = {
      tDiffuse: { value: null as THREE.Texture | null },
      tDepth: { value: null as THREE.Texture | null },
      resolution: {
        value: new THREE.Vector2(container.clientWidth, container.clientHeight),
      },
      cameraNear: { value: camera.near },
      cameraFar: { value: camera.far },
      radius: { value: 5.0 },
      intensity: { value: 1.5 },
    };

    const ssaoMaterial = new THREE.ShaderMaterial({
      vertexShader: ssaoVertexShader,
      fragmentShader: ssaoFragmentShader,
      uniforms: ssaoUniforms,
    });

    const postScene = new THREE.Scene();
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const postPlane = new THREE.PlaneGeometry(2, 2);
    const postQuad = new THREE.Mesh(postPlane, ssaoMaterial);
    postScene.add(postQuad);

    const clock = new THREE.Clock();
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Animate camera slightly
      camera.position.x = 5 + Math.sin(elapsed * 0.2) * 2;
      camera.position.z = 8 + Math.cos(elapsed * 0.2) * 2;
      camera.lookAt(0, 0, 0);

      // Render scene to target
      renderer.setRenderTarget(renderTarget);
      renderer.render(scene, camera);

      // Apply SSAO pass
      ssaoMaterial.uniforms.tDiffuse.value = renderTarget.texture;
      ssaoMaterial.uniforms.tDepth.value = renderTarget.depthTexture;
      ssaoMaterial.uniforms.cameraNear.value = camera.near;
      ssaoMaterial.uniforms.cameraFar.value = camera.far;

      renderer.setRenderTarget(null);
      renderer.render(postScene, postCamera);
    };
    animate();

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderTarget.setSize(width, height);
      ssaoMaterial.uniforms.resolution.value.set(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      renderer.dispose();
      renderTarget.dispose();
      renderTarget.depthTexture?.dispose();
      boxGeo.dispose();
      boxMat.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      pillarGeo.dispose();
      pillarMat.dispose();
      postPlane.dispose();
      ssaoMaterial.dispose();
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

export default T15_SSAO;
