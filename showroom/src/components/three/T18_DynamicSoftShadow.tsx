import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const pcssVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const pcssFragmentShader = `
  uniform sampler2D shadowMap;
  uniform vec2 shadowMapSize;
  uniform vec3 shadowColor;
  uniform float softness;
  varying vec2 vUv;

  // PCSS-like soft shadow approximation
  float sampleShadow(sampler2D map, vec2 uv, float bias) {
    vec4 texel = texture2D(map, uv);
    return texel.r;
  }

  void main() {
    vec2 texelSize = 1.0 / shadowMapSize;
    float shadow = 0.0;
    int samples = 16;
    float radius = softness * 3.0;

    for (int x = -2; x <= 2; x++) {
      for (int y = -2; y <= 2; y++) {
        vec2 offset = vec2(float(x), float(y)) * texelSize * radius;
        shadow += sampleShadow(shadowMap, vUv + offset, 0.0);
      }
    }
    shadow /= 25.0;

    float darkness = 1.0 - shadow;
    vec3 color = mix(vec3(1.0), shadowColor, darkness);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const T18_DynamicSoftShadow: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 6, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 1.0,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Animated objects
    const objects: THREE.Mesh[] = [];
    const objectGeometries = [
      new THREE.SphereGeometry(0.6, 32, 32),
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.CylinderGeometry(0.4, 0.4, 1.2, 32),
      new THREE.TorusGeometry(0.5, 0.2, 16, 32),
      new THREE.DodecahedronGeometry(0.6),
    ];
    const objectMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      roughness: 0.5,
      metalness: 0.3,
    });

    for (let i = 0; i < 5; i++) {
      const mesh = new THREE.Mesh(objectGeometries[i], objectMaterial);
      mesh.position.set((i - 2) * 2, 0.5 + Math.random() * 0.5, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      objects.push(mesh);
    }

    // Moving light source
    const movingLight = new THREE.PointLight(0xffaa00, 2, 20);
    movingLight.castShadow = true;
    movingLight.shadow.mapSize.width = 2048;
    movingLight.shadow.mapSize.height = 2048;
    movingLight.shadow.bias = -0.0001;
    movingLight.shadow.radius = 4; // Soft shadow radius (PCFSoftShadowMap)
    scene.add(movingLight);

    // Light visual representation
    const lightSphereGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const lightSphereMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const lightSphere = new THREE.Mesh(lightSphereGeo, lightSphereMat);
    scene.add(lightSphere);

    // Secondary directional light with soft shadows
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -10;
    dirLight.shadow.radius = 8;
    scene.add(dirLight);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Shadow visualization plane (to show shadow map)
    const shadowDisplayGeo = new THREE.PlaneGeometry(4, 4);
    const shadowDisplayMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const shadowDisplay = new THREE.Mesh(shadowDisplayGeo, shadowDisplayMat);
    shadowDisplay.position.set(5, 2, -3);
    shadowDisplay.rotation.y = -Math.PI / 4;
    scene.add(shadowDisplay);

    // Post-processing for enhanced soft shadows
    const renderTarget = new THREE.WebGLRenderTarget(
      container.clientWidth,
      container.clientHeight
    );
    renderTarget.depthTexture = new THREE.DepthTexture(
      container.clientWidth,
      container.clientHeight
    );

    const pcssMaterial = new THREE.ShaderMaterial({
      vertexShader: pcssVertexShader,
      fragmentShader: pcssFragmentShader,
      uniforms: {
        shadowMap: { value: null as THREE.Texture | null },
        shadowMapSize: { value: new THREE.Vector2(2048, 2048) },
        shadowColor: { value: new THREE.Color(0x222244) },
        softness: { value: 1.0 },
      },
    });

    const postScene = new THREE.Scene();
    const _postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), pcssMaterial);
    postScene.add(postQuad);

    const clock = new THREE.Clock();
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Animate objects
      objects.forEach((obj, i) => {
        obj.position.y = 0.5 + Math.sin(elapsed * 1.5 + i * 1.2) * 0.8;
        obj.rotation.x = elapsed * 0.5 + i;
        obj.rotation.z = elapsed * 0.3 + i * 0.5;
      });

      // Animate moving light in a figure-8 pattern
      const lightX = Math.sin(elapsed * 0.7) * 4;
      const lightZ = Math.sin(elapsed * 1.4) * 3;
      const lightY = 3 + Math.sin(elapsed * 0.5) * 1;
      movingLight.position.set(lightX, lightY, lightZ);
      lightSphere.position.copy(movingLight.position);

      // Adjust shadow softness based on light height
      const heightFactor = Math.max(0.2, (lightY - 1) / 5);
      movingLight.shadow.radius = 2 + heightFactor * 6;

      // Update shadow display texture
      shadowDisplayMat.map = movingLight.shadow.map?.texture || null;
      shadowDisplayMat.needsUpdate = true;

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
      renderTarget.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      renderer.dispose();
      groundGeometry.dispose();
      groundMaterial.dispose();
      objectGeometries.forEach((geo) => geo.dispose());
      objectMaterial.dispose();
      lightSphereGeo.dispose();
      lightSphereMat.dispose();
      shadowDisplayGeo.dispose();
      shadowDisplayMat.dispose();
      renderTarget.dispose();
      renderTarget.depthTexture?.dispose();
      pcssMaterial.dispose();
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

export default T18_DynamicSoftShadow;
