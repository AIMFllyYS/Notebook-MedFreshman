import { useRef, useEffect } from 'react';
import * as THREE from 'three';

function createSkinnedCharacter(): THREE.SkinnedMesh {
  const segmentHeight = 1.2;
  const segmentCount = 4;
  const height = segmentHeight * segmentCount;
  const halfHeight = height / 2;

  // Create geometry for the character body
  const geometry = new THREE.CylinderGeometry(0.3, 0.4, height, 8, segmentCount);
  const position = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  const skinIndices: number[] = [];
  const skinWeights: number[] = [];

  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);

    const y = vertex.y + halfHeight;
    const skinIndex = Math.floor(y / segmentHeight);
    const skinWeight = (y % segmentHeight) / segmentHeight;

    skinIndices.push(skinIndex, skinIndex + 1, 0, 0);
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
  }

  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));

  // Create bones
  const bones: THREE.Bone[] = [];
  let prevBone: THREE.Bone | null = null;

  for (let i = 0; i <= segmentCount; i++) {
    const bone = new THREE.Bone();
    bone.position.y = i === 0 ? 0 : segmentHeight;
    if (prevBone) {
      prevBone.add(bone);
    }
    bones.push(bone);
    prevBone = bone;
  }

  const skeleton = new THREE.Skeleton(bones);

  const material = new THREE.MeshStandardMaterial({
    color: 0x3498db,
    roughness: 0.5,
    metalness: 0.3,
  });

  const mesh = new THREE.SkinnedMesh(geometry, material);
  const rootBone = bones[0];
  mesh.add(rootBone);
  mesh.bind(skeleton);

  // Add limbs
  const limbMat = new THREE.MeshStandardMaterial({ color: 0x2ecc71, roughness: 0.5 });

  // Arms
  for (let side = -1; side <= 1; side += 2) {
    const armGeo = new THREE.CylinderGeometry(0.1, 0.12, 1.5, 6, 2);
    const armPos = armGeo.attributes.position;
    const armIndices: number[] = [];
    const armWeights: number[] = [];

    for (let i = 0; i < armPos.count; i++) {
      vertex.fromBufferAttribute(armPos, i);
      const y = vertex.y + 0.75;
      const idx = Math.floor(y / 0.75);
      const w = (y % 0.75) / 0.75;
      armIndices.push(Math.min(idx, 1), Math.min(idx + 1, 2), 0, 0);
      armWeights.push(1 - w, w, 0, 0);
    }

    armGeo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(armIndices, 4));
    armGeo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(armWeights, 4));

    const armBones: THREE.Bone[] = [];
    const armRoot = new THREE.Bone();
    armRoot.position.set(side * 0.5, halfHeight - 0.5, 0);
    const armMid = new THREE.Bone();
    armMid.position.y = -0.75;
    armRoot.add(armMid);
    armBones.push(armRoot, armMid);

    const armMesh = new THREE.SkinnedMesh(armGeo, limbMat);
    armMesh.add(armRoot);
    armMesh.bind(new THREE.Skeleton(armBones));
    mesh.add(armMesh);
  }

  // Legs
  for (let side = -1; side <= 1; side += 2) {
    const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 1.8, 6, 2);
    const legPos = legGeo.attributes.position;
    const legIndices: number[] = [];
    const legWeights: number[] = [];

    for (let i = 0; i < legPos.count; i++) {
      vertex.fromBufferAttribute(legPos, i);
      const y = vertex.y + 0.9;
      const idx = Math.floor(y / 0.9);
      const w = (y % 0.9) / 0.9;
      legIndices.push(Math.min(idx, 1), Math.min(idx + 1, 2), 0, 0);
      legWeights.push(1 - w, w, 0, 0);
    }

    legGeo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(legIndices, 4));
    legGeo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(legWeights, 4));

    const legBones: THREE.Bone[] = [];
    const legRoot = new THREE.Bone();
    legRoot.position.set(side * 0.25, -halfHeight + 0.2, 0);
    const legMid = new THREE.Bone();
    legMid.position.y = -0.9;
    legRoot.add(legMid);
    legBones.push(legRoot, legMid);

    const legMesh = new THREE.SkinnedMesh(legGeo, limbMat);
    legMesh.add(legRoot);
    legMesh.bind(new THREE.Skeleton(legBones));
    mesh.add(legMesh);
  }

  // Head
  const headGeo = new THREE.SphereGeometry(0.35, 12, 12);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xf39c12, roughness: 0.5 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = halfHeight + 0.5;
  mesh.add(head);

  return mesh;
}

export default function T43_SkeletalAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rafRef = useRef<number>(0);
  const characterRef = useRef<THREE.SkinnedMesh | null>(null);
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
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x00d4ff, 0.5);
    spotLight.position.set(-5, 8, -5);
    scene.add(spotLight);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x333333);
    scene.add(gridHelper);

    const character = createSkinnedCharacter();
    character.position.y = 2.4;
    character.castShadow = true;
    scene.add(character);
    characterRef.current = character;

    function animate() {
      rafRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;
      const t = timeRef.current;

      // Animate skeleton
      const skeleton = character.skeleton;
      if (skeleton) {
        // Spine wave
        for (let i = 1; i < skeleton.bones.length; i++) {
          const bone = skeleton.bones[i];
          bone.rotation.x = Math.sin(t * 2 + i * 0.5) * 0.15;
          bone.rotation.z = Math.cos(t * 1.5 + i * 0.3) * 0.1;
        }
      }

      // Animate limbs by traversing child skinned meshes
      character.traverse((child) => {
        if (child instanceof THREE.SkinnedMesh && child !== character) {
          const skel = child.skeleton;
          if (skel && skel.bones.length > 1) {
            const rootPos = child.position.x;
            const isArm = Math.abs(rootPos) > 0.3;

            if (isArm) {
              skel.bones[0].rotation.z = (rootPos > 0 ? 1 : -1) * Math.sin(t * 3) * 0.5;
              skel.bones[1].rotation.x = Math.sin(t * 3 + 1) * 0.3;
            } else {
              skel.bones[0].rotation.x = Math.sin(t * 4 + (rootPos > 0 ? 0 : Math.PI)) * 0.4;
              skel.bones[1].rotation.x = Math.abs(Math.sin(t * 4 + (rootPos > 0 ? 0 : Math.PI))) * 0.5;
            }
          }
        }
      });

      // Bobbing motion
      character.position.y = 2.4 + Math.sin(t * 2) * 0.1;
      character.rotation.y = Math.sin(t * 0.5) * 0.3;

      camera.position.x = Math.sin(t * 0.3) * 8;
      camera.position.z = Math.cos(t * 0.3) * 8;
      camera.lookAt(0, 1.5, 0);

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
      character.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      groundGeo.dispose();
      groundMat.dispose();
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
