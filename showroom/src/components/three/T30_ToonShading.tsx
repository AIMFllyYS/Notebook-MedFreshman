import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const toonVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const toonFragmentShader = `
  uniform vec3 uColor;
  uniform vec3 uLightDir;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;

  float toonRamp(float intensity) {
    if (intensity > 0.9) return 1.0;
    if (intensity > 0.6) return 0.7;
    if (intensity > 0.3) return 0.4;
    return 0.15;
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(uLightDir);
    vec3 V = normalize(vViewPosition);

    float diff = max(dot(N, L), 0.0);
    float toonDiff = toonRamp(diff);

    // Specular (Blinn-Phong with toon steps)
    vec3 H = normalize(L + V);
    float spec = pow(max(dot(N, H), 0.0), 32.0);
    float toonSpec = spec > 0.7 ? 1.0 : 0.0;

    vec3 finalColor = uColor * toonDiff + vec3(1.0) * toonSpec * 0.5;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const outlineVertexShader = `
  uniform float uOutlineWidth;
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec3 pos = position + normal * uOutlineWidth;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const outlineFragmentShader = `
  void main() {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
`;

const T30_ToonShading: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rafRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8e0d5);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Character group
    const characterGroup = new THREE.Group();
    scene.add(characterGroup);

    // Body
    const bodyGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const bodyMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xff6b6b) },
        uLightDir: { value: new THREE.Vector3(1, 1, 2).normalize() },
      },
      vertexShader: toonVertexShader,
      fragmentShader: toonFragmentShader,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    characterGroup.add(body);

    // Body outline
    const bodyOutlineMat = new THREE.ShaderMaterial({
      uniforms: { uOutlineWidth: { value: 0.04 } },
      vertexShader: outlineVertexShader,
      fragmentShader: outlineFragmentShader,
      side: THREE.BackSide,
    });
    const bodyOutline = new THREE.Mesh(bodyGeo, bodyOutlineMat);
    characterGroup.add(bodyOutline);

    // Head
    const headGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const headMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xffd93d) },
        uLightDir: { value: new THREE.Vector3(1, 1, 2).normalize() },
      },
      vertexShader: toonVertexShader,
      fragmentShader: toonFragmentShader,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.8;
    characterGroup.add(head);

    const headOutline = new THREE.Mesh(headGeo, bodyOutlineMat);
    headOutline.position.copy(head.position);
    characterGroup.add(headOutline);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.25, 1.9, 0.7);
    characterGroup.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.25, 1.9, 0.7);
    characterGroup.add(rightEye);

    // Arms
    const armGeo = new THREE.CapsuleGeometry(0.25, 1.2, 8, 16);
    const armMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0x4ecdc4) },
        uLightDir: { value: new THREE.Vector3(1, 1, 2).normalize() },
      },
      vertexShader: toonVertexShader,
      fragmentShader: toonFragmentShader,
    });

    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-1.3, 0.3, 0);
    leftArm.rotation.z = Math.PI / 6;
    characterGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(1.3, 0.3, 0);
    rightArm.rotation.z = -Math.PI / 6;
    characterGroup.add(rightArm);

    // Arm outlines
    const armOutlineMat = new THREE.ShaderMaterial({
      uniforms: { uOutlineWidth: { value: 0.03 } },
      vertexShader: outlineVertexShader,
      fragmentShader: outlineFragmentShader,
      side: THREE.BackSide,
    });
    const leftArmOutline = new THREE.Mesh(armGeo, armOutlineMat);
    leftArmOutline.position.copy(leftArm.position);
    leftArmOutline.rotation.copy(leftArm.rotation);
    characterGroup.add(leftArmOutline);

    const rightArmOutline = new THREE.Mesh(armGeo, armOutlineMat);
    rightArmOutline.position.copy(rightArm.position);
    rightArmOutline.rotation.copy(rightArm.rotation);
    characterGroup.add(rightArmOutline);

    // Legs
    const legGeo = new THREE.CapsuleGeometry(0.28, 1.0, 8, 16);
    const legMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0x1a535c) },
        uLightDir: { value: new THREE.Vector3(1, 1, 2).normalize() },
      },
      vertexShader: toonVertexShader,
      fragmentShader: toonFragmentShader,
    });

    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.4, -1.6, 0);
    characterGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.4, -1.6, 0);
    characterGroup.add(rightLeg);

    const legOutlineMat = new THREE.ShaderMaterial({
      uniforms: { uOutlineWidth: { value: 0.03 } },
      vertexShader: outlineVertexShader,
      fragmentShader: outlineFragmentShader,
      side: THREE.BackSide,
    });
    const leftLegOutline = new THREE.Mesh(legGeo, legOutlineMat);
    leftLegOutline.position.copy(leftLeg.position);
    characterGroup.add(leftLegOutline);

    const rightLegOutline = new THREE.Mesh(legGeo, legOutlineMat);
    rightLegOutline.position.copy(rightLeg.position);
    characterGroup.add(rightLegOutline);

    // Ground shadow
    const shadowGeo = new THREE.CircleGeometry(2, 32);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.2 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -2.2;
    scene.add(shadow);

    // Animation
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;
      const t = timeRef.current;

      characterGroup.rotation.y = Math.sin(t * 0.5) * 0.3;
      characterGroup.position.y = Math.sin(t * 2) * 0.1;

      // Arm swing
      leftArm.rotation.x = Math.sin(t * 3) * 0.3;
      leftArmOutline.rotation.x = leftArm.rotation.x;
      rightArm.rotation.x = Math.sin(t * 3 + Math.PI) * 0.3;
      rightArmOutline.rotation.x = rightArm.rotation.x;

      renderer.render(scene, camera);
    };

    animate();

    // Resize
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
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
      bodyGeo.dispose();
      bodyMat.dispose();
      bodyOutlineMat.dispose();
      headGeo.dispose();
      headMat.dispose();
      eyeGeo.dispose();
      eyeMat.dispose();
      armGeo.dispose();
      armMat.dispose();
      armOutlineMat.dispose();
      legGeo.dispose();
      legMat.dispose();
      legOutlineMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      renderer.dispose();
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

export default T30_ToonShading;
