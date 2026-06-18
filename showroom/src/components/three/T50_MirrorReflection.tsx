import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function T50_MirrorReflection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rafRef = useRef<number>(0);
  const mirrorCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const mirrorRenderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const mirrorMeshRef = useRef<THREE.Mesh | null>(null);
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

    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x00d4ff, 0.6, 20);
    pointLight.position.set(-3, 4, -3);
    scene.add(pointLight);

    // Mirror plane setup
    const w = container.clientWidth;
    const h = container.clientHeight;
    const mirrorRenderTarget = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });
    mirrorRenderTargetRef.current = mirrorRenderTarget;

    const mirrorCamera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    mirrorCameraRef.current = mirrorCamera;

    // Mirror plane
    const mirrorGeo = new THREE.PlaneGeometry(8, 8);
    const mirrorMat = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.05,
      metalness: 0.95,
      map: mirrorRenderTarget.texture,
      envMapIntensity: 1.0,
    });
    const mirrorMesh = new THREE.Mesh(mirrorGeo, mirrorMat);
    mirrorMesh.position.set(0, 0, -2);
    mirrorMesh.receiveShadow = true;
    scene.add(mirrorMesh);
    mirrorMeshRef.current = mirrorMesh;

    // Mirror frame
    const frameGeo = new THREE.BoxGeometry(8.4, 8.4, 0.2);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.3, metalness: 0.8 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 0, -2.15);
    scene.add(frame);

    // Objects to reflect
    const objects: THREE.Mesh[] = [];

    // Central torus knot
    const torusGeo = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0xe74c3c,
      roughness: 0.2,
      metalness: 0.6,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(0, 2, 1);
    torus.castShadow = true;
    scene.add(torus);
    objects.push(torus);

    // Floating spheres
    const sphereColors = [0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6];
    for (let i = 0; i < 4; i++) {
      const sphereGeo = new THREE.SphereGeometry(0.5, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: sphereColors[i],
        roughness: 0.1,
        metalness: 0.7,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      const angle = (i / 4) * Math.PI * 2;
      sphere.position.set(Math.cos(angle) * 3, 1.5 + Math.sin(i) * 0.5, Math.sin(angle) * 3);
      sphere.castShadow = true;
      scene.add(sphere);
      objects.push(sphere);
    }

    // Box
    const boxGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x1abc9c,
      roughness: 0.3,
      metalness: 0.5,
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(-2.5, 1, 2);
    box.castShadow = true;
    scene.add(box);
    objects.push(box);

    // Cylinder
    const cylGeo = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
    const cylMat = new THREE.MeshStandardMaterial({
      color: 0xe67e22,
      roughness: 0.4,
      metalness: 0.4,
    });
    const cylinder = new THREE.Mesh(cylGeo, cylMat);
    cylinder.position.set(2.5, 1, 2);
    cylinder.castShadow = true;
    scene.add(cylinder);
    objects.push(cylinder);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x2c3e50,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    scene.add(floor);

    function updateMirrorCamera() {
      const mirrorNormal = new THREE.Vector3(0, 0, 1);
      mirrorNormal.applyQuaternion(mirrorMesh.quaternion);

      const mirrorPosition = mirrorMesh.position.clone();
      const cameraPosition = camera.position.clone();

      // Reflect camera position across mirror plane
      const toCamera = new THREE.Vector3().subVectors(cameraPosition, mirrorPosition);
      const distance = toCamera.dot(mirrorNormal);
      const reflectedPosition = cameraPosition.clone().sub(mirrorNormal.clone().multiplyScalar(distance * 2));

      mirrorCamera.position.copy(reflectedPosition);

      // Reflect look direction
      const lookAtPoint = new THREE.Vector3(0, 1, 0);
      const toLookAt = new THREE.Vector3().subVectors(lookAtPoint, mirrorPosition);
      const lookDistance = toLookAt.dot(mirrorNormal);
      const reflectedLookAt = lookAtPoint.clone().sub(mirrorNormal.clone().multiplyScalar(lookDistance * 2));

      mirrorCamera.lookAt(reflectedLookAt);
      mirrorCamera.updateMatrixWorld(true);
    }

    function animate() {
      rafRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;
      const t = timeRef.current;

      // Animate objects
      torus.rotation.x = t * 0.5;
      torus.rotation.y = t * 0.3;
      torus.position.y = 2 + Math.sin(t) * 0.3;

      for (let i = 0; i < 4; i++) {
        const sphere = objects[i + 1];
        const angle = (i / 4) * Math.PI * 2 + t * 0.3;
        sphere.position.x = Math.cos(angle) * 3;
        sphere.position.z = Math.sin(angle) * 3;
        sphere.position.y = 1.5 + Math.sin(t * 1.5 + i) * 0.5;
      }

      box.rotation.x = t * 0.4;
      box.rotation.y = t * 0.6;
      cylinder.rotation.z = Math.sin(t) * 0.2;

      // Camera orbit
      camera.position.x = Math.sin(t * 0.2) * 8;
      camera.position.z = Math.cos(t * 0.2) * 8 + 2;
      camera.lookAt(0, 1.5, 0);

      // Render mirror
      updateMirrorCamera();
      renderer.setRenderTarget(mirrorRenderTarget);
      renderer.render(scene, mirrorCamera);
      renderer.setRenderTarget(null);

      // Render main scene
      renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      mirrorCamera.aspect = nw / nh;
      mirrorCamera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      mirrorRenderTarget.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafRef.current);
      renderer.dispose();
      mirrorRenderTarget.dispose();
      mirrorGeo.dispose();
      mirrorMat.dispose();
      frameGeo.dispose();
      frameMat.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      boxGeo.dispose();
      boxMat.dispose();
      cylGeo.dispose();
      cylMat.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      for (let i = 1; i <= 4; i++) {
        objects[i].geometry.dispose();
        (objects[i].material as THREE.Material).dispose();
      }
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
