import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface Annotation {
  id: number;
  position: THREE.Vector3;
  text: string;
}

const T39_RaycastAnnotation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rafRef = useRef<number>(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const annotationsRef = useRef<Annotation[]>([]);
  const nextIdRef = useRef(1);

  useEffect(() => {
    annotationsRef.current = annotations;
  }, [annotations]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222233);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Objects
    const sphereGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({ color: 0x4488ff, roughness: 0.3 });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(-2, 1, 0);
    sphere.castShadow = true;
    scene.add(sphere);

    const boxGeo = new THREE.BoxGeometry(2, 2, 2);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xff8844, roughness: 0.3 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(2, 1, 0);
    box.castShadow = true;
    scene.add(box);

    const torusGeo = new THREE.TorusGeometry(1, 0.3, 16, 50);
    const torusMat = new THREE.MeshStandardMaterial({ color: 0x44ff88, roughness: 0.3 });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(0, 1, -2);
    torus.rotation.x = Math.PI / 2;
    torus.castShadow = true;
    scene.add(torus);

    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x333344 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Sprite markers group
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);

    const createMarker = (position: THREE.Vector3, id: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(32, 32, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(id), 32, 32);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.copy(position).add(new THREE.Vector3(0, 1.5, 0));
      sprite.scale.set(0.8, 0.8, 0.8);
      sprite.userData = { id };
      return sprite;
    };

    // Click handler
    const onClick = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([sphere, box, torus, floor]);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        const id = nextIdRef.current++;
        const text = `标注 #${id}`;
        const newAnnotation: Annotation = { id, position: point.clone(), text };
        setAnnotations((prev) => [...prev, newAnnotation]);

        const marker = createMarker(point, id);
        if (marker) {
          markersGroup.add(marker);
        }
      }
    };
    container.addEventListener('click', onClick);

    // Hover highlight
    let hoveredObj: THREE.Mesh | null = null;
    const originalColor = new THREE.Color();

    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([sphere, box, torus]);

      if (hoveredObj && hoveredObj.material instanceof THREE.MeshStandardMaterial) {
        hoveredObj.material.color.copy(originalColor);
        hoveredObj = null;
      }

      if (intersects.length > 0) {
        const obj = intersects[0].object as THREE.Mesh;
        if (obj.material instanceof THREE.MeshStandardMaterial) {
          originalColor.copy(obj.material.color);
          obj.material.color.setHex(0xffffff);
          hoveredObj = obj;
        }
      }
    };
    container.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      container.removeEventListener('click', onClick);
      container.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      boxGeo.dispose();
      boxMat.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      markersGroup.children.forEach((child) => {
        const sprite = child as THREE.Sprite;
        if (sprite.material instanceof THREE.SpriteMaterial && sprite.material.map) {
          sprite.material.map.dispose();
          sprite.material.dispose();
        }
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%' }}
      />
      {annotations.map((ann) => (
        <div
          key={ann.id}
          style={{
            position: 'absolute',
            top: 8,
            left: 8 + (ann.id - 1) * 120,
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 12,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {ann.text} @ ({ann.position.x.toFixed(1)}, {ann.position.y.toFixed(1)}, {ann.position.z.toFixed(1)})
        </div>
      ))}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: 12,
          pointerEvents: 'none',
        }}
      >
        点击物体添加标注
      </div>
    </div>
  );
};

export default T39_RaycastAnnotation;
