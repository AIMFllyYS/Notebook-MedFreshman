import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// Custom Bokeh/DOF shader approximation since BokehPass may not be available in all builds
const dofShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    tDepth: { value: null as THREE.Texture | null },
    cameraNear: { value: 0.1 },
    cameraFar: { value: 100 },
    focus: { value: 10.0 },
    aperture: { value: 0.005 },
    maxBlur: { value: 1.0 },
    aspect: { value: 1.0 },
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
    uniform float focus;
    uniform float aperture;
    uniform float maxBlur;
    uniform float aspect;
    varying vec2 vUv;

    float readDepth(sampler2D depthSampler, vec2 coord) {
      float fragCoordZ = texture2D(depthSampler, coord).x;
      float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
      return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
    }

    #include <packing>

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float depth = readDepth(tDepth, vUv);
      float depthValue = depth * (cameraFar - cameraNear);

      float blur = clamp(abs(depthValue - focus) * aperture, 0.0, maxBlur);

      vec2 direction = vec2(1.0, aspect);
      vec4 sum = vec4(0.0);
      float total = 0.0;

      for (float i = -4.0; i <= 4.0; i += 1.0) {
        float weight = 1.0 - abs(i) / 5.0;
        vec2 offset = vec2(i * blur * 0.01) * direction;
        sum += texture2D(tDiffuse, vUv + offset) * weight;
        total += weight;
      }

      vec4 blurColor = sum / total;

      // Simple radial blur for out-of-focus areas
      vec4 radial = vec4(0.0);
      float rTotal = 0.0;
      for (float r = 1.0; r <= 8.0; r += 1.0) {
        float w = 1.0 / r;
        vec2 off = vec2(cos(r), sin(r)) * blur * 0.015;
        radial += texture2D(tDiffuse, vUv + off) * w;
        rTotal += w;
      }
      radial /= rTotal;

      gl_FragColor = mix(color, radial, blur);
    }
  `,
};

const T32_DepthOfField: React.FC = () => {
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
    scene.background = new THREE.Color(0x1a1a2e);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
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

    const dofPass = new ShaderPass(dofShader);
    dofPass.uniforms['tDepth'].value = depthTexture;
    dofPass.uniforms['cameraNear'].value = camera.near;
    dofPass.uniforms['cameraFar'].value = camera.far;
    dofPass.uniforms['aspect'].value = width / height;
    composer.addPass(dofPass);
    composerRef.current = composer;

    // Objects: grid of boxes at different depths
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0xff5555, roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0x55ff55, roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0x5555ff, roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0xffff55, roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0xff55ff, roughness: 0.3 }),
    ];

    const meshes: THREE.Mesh[] = [];
    for (let z = 0; z < 5; z++) {
      for (let x = -3; x <= 3; x++) {
        const mat = materials[z % materials.length];
        const mesh = new THREE.Mesh(boxGeo, mat);
        mesh.position.set(x * 2, 0, -z * 5);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        meshes.push(mesh);
      }
    }

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Animate focus back and forth
    let time = 0;
    const animate = () => {
      time += 0.01;
      const focusZ = 10 + Math.sin(time) * 8;
      dofPass.uniforms['focus'].value = focusZ;

      meshes.forEach((mesh, i) => {
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.01;
        mesh.position.y = Math.sin(time + i * 0.5) * 0.5;
      });

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
      dofPass.uniforms['aspect'].value = w / h;
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
      composer.dispose();
      renderTarget.dispose();
      depthTexture.dispose();
      renderer.dispose();
      boxGeo.dispose();
      materials.forEach((m) => m.dispose());
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

export default T32_DepthOfField;
