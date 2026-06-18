import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// Custom Screen Space Reflection approximation shader
const ssrShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    tDepth: { value: null as THREE.Texture | null },
    cameraNear: { value: 0.1 },
    cameraFar: { value: 100 },
    cameraMatrixWorld: { value: new THREE.Matrix4() },
    cameraProjectionMatrixInverse: { value: new THREE.Matrix4() },
    resolution: { value: new THREE.Vector2(1, 1) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform sampler2D tDepth;
    uniform float cameraNear;
    uniform float cameraFar;
    uniform mat4 cameraMatrixWorld;
    uniform mat4 cameraProjectionMatrixInverse;
    uniform vec2 resolution;
    varying vec2 vUv;

    #include <packing>

    float getDepth(vec2 uv) {
      return texture2D(tDepth, uv).x;
    }

    float getViewZ(float depth) {
      return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
    }

    vec3 getViewPosition(vec2 uv, float depth) {
      vec4 clipSpacePosition = vec4(uv * 2.0 - 1.0, depth, 1.0);
      vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
      return viewSpacePosition.xyz / viewSpacePosition.w;
    }

    vec3 getWorldPosition(vec2 uv, float depth) {
      vec3 viewPosition = getViewPosition(uv, depth);
      return (cameraMatrixWorld * vec4(viewPosition, 1.0)).xyz;
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float depth = getDepth(vUv);

      if (depth >= 1.0) {
        gl_FragColor = color;
        return;
      }

      vec3 worldPos = getWorldPosition(vUv, depth);
      vec3 viewPos = getViewPosition(vUv, depth);

      // Approximate normal from depth derivatives
      vec2 texel = 1.0 / resolution;
      float depthL = getDepth(vUv + vec2(-texel.x, 0.0));
      float depthR = getDepth(vUv + vec2(texel.x, 0.0));
      float depthU = getDepth(vUv + vec2(0.0, texel.y));
      float depthD = getDepth(vUv + vec2(0.0, -texel.y));

      vec3 posL = getWorldPosition(vUv + vec2(-texel.x, 0.0), depthL);
      vec3 posR = getWorldPosition(vUv + vec2(texel.x, 0.0), depthR);
      vec3 posU = getWorldPosition(vUv + vec2(0.0, texel.y), depthU);
      vec3 posD = getWorldPosition(vUv + vec2(0.0, -texel.y), depthD);

      vec3 normal = normalize(cross(posR - posL, posU - posD));

      // Reflection vector (view-space)
      vec3 viewDir = normalize(-viewPos);
      vec3 reflectDir = reflect(-viewDir, normal);

      // Simple ray march in screen space
      vec3 rayPos = viewPos;
      vec3 rayStep = reflectDir * 0.15;
      vec4 reflectionColor = vec4(0.0);
      float totalWeight = 0.0;

      for (int i = 1; i <= 16; i++) {
        vec3 nextPos = rayPos + rayStep * float(i);
        vec4 clipPos = vec4(nextPos, 1.0);
        // Reproject to screen (simplified)
        vec2 screenUV = vUv + reflectDir.xy * float(i) * 0.003;

        if (screenUV.x < 0.0 || screenUV.x > 1.0 || screenUV.y < 0.0 || screenUV.y > 1.0) break;

        float sampleDepth = getDepth(screenUV);
        float sampleViewZ = getViewZ(sampleDepth);

        if (sampleViewZ > nextPos.z && abs(sampleViewZ - nextPos.z) < 0.5) {
          float weight = 1.0 - float(i) / 16.0;
          reflectionColor += texture2D(tDiffuse, screenUV) * weight;
          totalWeight += weight;
          break;
        }
      }

      if (totalWeight > 0.0) {
        reflectionColor /= totalWeight;
        // Fresnel approximation
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
        color.rgb = mix(color.rgb, reflectionColor.rgb, fresnel * 0.5);
      }

      gl_FragColor = color;
    }
  `,
};

const T34_SSR: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Depth texture
    const depthTexture = new THREE.DepthTexture(width, height);
    depthTexture.type = THREE.UnsignedShortType;

    const renderTarget = new THREE.WebGLRenderTarget(width, height, {
      depthTexture,
      depthBuffer: true,
    });

    const composer = new EffectComposer(renderer, renderTarget);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const ssrPass = new ShaderPass(ssrShader);
    ssrPass.uniforms['tDepth'].value = depthTexture;
    ssrPass.uniforms['cameraNear'].value = camera.near;
    ssrPass.uniforms['cameraFar'].value = camera.far;
    ssrPass.uniforms['resolution'].value.set(width, height);
    composer.addPass(ssrPass);
    composerRef.current = composer;

    // Reflective floor
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.05,
      metalness: 0.9,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Objects above floor
    const sphereGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xff3366,
      roughness: 0.2,
      metalness: 0.7,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(-1.5, 0.8, 0);
    scene.add(sphere);

    const boxGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x33ff66,
      roughness: 0.2,
      metalness: 0.7,
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(1.5, 0.6, 0.5);
    scene.add(box);

    const torusGeo = new THREE.TorusGeometry(0.6, 0.2, 16, 50);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x3366ff,
      roughness: 0.2,
      metalness: 0.7,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(0, 0.8, -1);
    torus.rotation.x = Math.PI / 2;
    scene.add(torus);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(3, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0xffaa00, 5, 20);
    pointLight.position.set(-3, 4, 2);
    scene.add(pointLight);

    let time = 0;
    const animate = () => {
      time += 0.01;
      sphere.position.y = 0.8 + Math.sin(time) * 0.3;
      box.rotation.y += 0.01;
      box.rotation.x += 0.005;
      torus.rotation.z += 0.01;

      ssrPass.uniforms['cameraMatrixWorld'].value.copy(camera.matrixWorld);
      ssrPass.uniforms['cameraProjectionMatrixInverse'].value.copy(camera.projectionMatrixInverse);

      composer.render();
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      renderTarget.setSize(w, h);
      (depthTexture.image as any) = { width: w, height: h };
      ssrPass.uniforms['resolution'].value.set(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
      composer.dispose();
      renderTarget.dispose();
      depthTexture.dispose();
      renderer.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      boxGeo.dispose();
      boxMat.dispose();
      torusGeo.dispose();
      torusMat.dispose();
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

export default T34_SSR;
