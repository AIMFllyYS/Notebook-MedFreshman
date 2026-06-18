import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ptVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const ptFragmentShader = `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uPreviousFrame;
uniform float uFrameCount;

#define PI 3.14159265359
#define MAX_BOUNCES 4
#define SAMPLES_PER_FRAME 2

struct Ray {
  vec3 origin;
  vec3 direction;
};

struct Hit {
  float t;
  vec3 point;
  vec3 normal;
  vec3 albedo;
  float metallic;
  float roughness;
  vec3 emission;
};

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float hash3(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

vec2 random2(vec2 p) {
  return vec2(hash(p), hash(p + vec2(1.0, 0.0)));
}

vec3 random3(vec3 p) {
  return vec3(hash3(p), hash3(p + vec3(1.0, 0.0, 0.0)), hash3(p + vec3(0.0, 1.0, 0.0)));
}

vec3 randomInUnitSphere(vec3 seed) {
  vec3 r = random3(seed);
  float theta = r.x * 2.0 * PI;
  float phi = acos(2.0 * r.y - 1.0);
  float radius = pow(r.z, 1.0/3.0);
  return vec3(
    radius * sin(phi) * cos(theta),
    radius * sin(phi) * sin(theta),
    radius * cos(phi)
  );
}

vec3 randomInHemisphere(vec3 normal, vec3 seed) {
  vec3 r = randomInUnitSphere(seed);
  if (dot(r, normal) > 0.0) return r;
  return -r;
}

// Sphere
bool hitSphere(vec3 center, float radius, Ray ray, float tMin, float tMax, inout Hit hit) {
  vec3 oc = ray.origin - center;
  float a = dot(ray.direction, ray.direction);
  float halfB = dot(oc, ray.direction);
  float c = dot(oc, oc) - radius * radius;
  float discriminant = halfB * halfB - a * c;
  
  if (discriminant < 0.0) return false;
  
  float sqrtd = sqrt(discriminant);
  float root = (-halfB - sqrtd) / a;
  
  if (root < tMin || tMax < root) {
    root = (-halfB + sqrtd) / a;
    if (root < tMin || tMax < root) return false;
  }
  
  hit.t = root;
  hit.point = ray.origin + root * ray.direction;
  hit.normal = normalize(hit.point - center);
  return true;
}

// Plane
bool hitPlane(vec3 point, vec3 normal, Ray ray, float tMin, float tMax, inout Hit hit) {
  float denom = dot(normal, ray.direction);
  if (abs(denom) < 0.001) return false;
  
  float t = dot(point - ray.origin, normal) / denom;
  if (t < tMin || tMax < t) return false;
  
  hit.t = t;
  hit.point = ray.origin + t * ray.direction;
  hit.normal = normal;
  return true;
}

// Box
bool hitBox(vec3 boxMin, vec3 boxMax, Ray ray, float tMin, float tMax, inout Hit hit) {
  vec3 invDir = 1.0 / ray.direction;
  vec3 t0s = (boxMin - ray.origin) * invDir;
  vec3 t1s = (boxMax - ray.origin) * invDir;
  
  vec3 tsmaller = min(t0s, t1s);
  vec3 tbigger = max(t0s, t1s);
  
  float t0 = max(tMin, max(tsmaller.x, max(tsmaller.y, tsmaller.z)));
  float t1 = min(tMax, min(tbigger.x, min(tbigger.y, tbigger.z)));
  
  if (t0 >= t1) return false;
  
  hit.t = t0;
  hit.point = ray.origin + t0 * ray.direction;
  
  vec3 center = (boxMin + boxMax) * 0.5;
  vec3 size = boxMax - boxMin;
  vec3 local = hit.point - center;
  
  if (abs(local.x) / size.x > abs(local.y) / size.y && abs(local.x) / size.x > abs(local.z) / size.z) {
    hit.normal = vec3(sign(local.x), 0.0, 0.0);
  } else if (abs(local.y) / size.y > abs(local.z) / size.z) {
    hit.normal = vec3(0.0, sign(local.y), 0.0);
  } else {
    hit.normal = vec3(0.0, 0.0, sign(local.z));
  }
  
  return true;
}

bool traceRay(Ray ray, out Hit hit) {
  Hit tempHit;
  bool hitAnything = false;
  float closest = 1000.0;
  
  // Floor
  if (hitPlane(vec3(0.0, -1.0, 0.0), vec3(0.0, 1.0, 0.0), ray, 0.001, closest, tempHit)) {
    closest = tempHit.t;
    hit = tempHit;
    hit.albedo = vec3(0.8, 0.8, 0.8);
    hit.metallic = 0.0;
    hit.roughness = 0.8;
    hit.emission = vec3(0.0);
    // Checkerboard
    float check = mod(floor(hit.point.x) + floor(hit.point.z), 2.0);
    hit.albedo = mix(vec3(0.9, 0.9, 0.9), vec3(0.1, 0.1, 0.1), check);
    hitAnything = true;
  }
  
  // Metallic sphere
  if (hitSphere(vec3(-1.5, 0.0, 0.0), 1.0, ray, 0.001, closest, tempHit)) {
    closest = tempHit.t;
    hit = tempHit;
    hit.albedo = vec3(0.95, 0.95, 0.95);
    hit.metallic = 1.0;
    hit.roughness = 0.1;
    hit.emission = vec3(0.0);
    hitAnything = true;
  }
  
  // Gold sphere
  if (hitSphere(vec3(1.5, 0.0, 0.0), 1.0, ray, 0.001, closest, tempHit)) {
    closest = tempHit.t;
    hit = tempHit;
    hit.albedo = vec3(1.0, 0.78, 0.34);
    hit.metallic = 1.0;
    hit.roughness = 0.2;
    hit.emission = vec3(0.0);
    hitAnything = true;
  }
  
  // Red box
  if (hitBox(vec3(-0.5, -1.0, 2.0), vec3(0.5, 0.0, 3.0), ray, 0.001, closest, tempHit)) {
    closest = tempHit.t;
    hit = tempHit;
    hit.albedo = vec3(0.9, 0.2, 0.2);
    hit.metallic = 0.0;
    hit.roughness = 0.5;
    hit.emission = vec3(0.0);
    hitAnything = true;
  }
  
  // Blue box
  if (hitBox(vec3(-2.5, -1.0, -1.5), vec3(-1.5, 0.5, -0.5), ray, 0.001, closest, tempHit)) {
    closest = tempHit.t;
    hit = tempHit;
    hit.albedo = vec3(0.2, 0.3, 0.9);
    hit.metallic = 0.0;
    hit.roughness = 0.3;
    hit.emission = vec3(0.0);
    hitAnything = true;
  }
  
  // Light sphere (emissive)
  if (hitSphere(vec3(0.0, 3.0, -2.0), 0.8, ray, 0.001, closest, tempHit)) {
    closest = tempHit.t;
    hit = tempHit;
    hit.albedo = vec3(1.0, 1.0, 1.0);
    hit.metallic = 0.0;
    hit.roughness = 1.0;
    hit.emission = vec3(5.0, 5.0, 4.0);
    hitAnything = true;
  }
  
  return hitAnything;
}

vec3 tracePath(Ray ray, vec3 seed) {
  vec3 color = vec3(1.0);
  vec3 accumulated = vec3(0.0);
  
  for (int bounce = 0; bounce < MAX_BOUNCES; bounce++) {
    Hit hit;
    if (!traceRay(ray, hit)) {
      accumulated += color * vec3(0.05, 0.05, 0.1);
      break;
    }
    
    accumulated += color * hit.emission;
    
    vec3 target = hit.point + hit.normal + randomInUnitSphere(seed + vec3(float(bounce)));
    
    // Metallic reflection
    if (hit.metallic > 0.5) {
      vec3 reflected = reflect(ray.direction, hit.normal);
      reflected += randomInUnitSphere(seed + vec3(float(bounce))) * hit.roughness;
      ray.origin = hit.point + hit.normal * 0.001;
      ray.direction = normalize(reflected);
      color *= hit.albedo;
    } else {
      // Diffuse
      ray.origin = hit.point + hit.normal * 0.001;
      ray.direction = normalize(target - hit.point);
      color *= hit.albedo;
    }
  }
  
  return accumulated;
}

void main() {
  vec2 uv = (vUv - 0.5) * 2.0;
  uv.x *= uResolution.x / uResolution.y;
  
  vec3 camPos = vec3(0.0, 2.0, 6.0);
  vec3 lookAt = vec3(0.0, 0.0, 0.0);
  vec3 up = vec3(0.0, 1.0, 0.0);
  
  float fov = 60.0 * PI / 180.0;
  float focalLength = 1.0 / tan(fov / 2.0);
  
  vec3 forward = normalize(lookAt - camPos);
  vec3 right = normalize(cross(forward, up));
  vec3 camUp = cross(right, forward);
  
  vec3 color = vec3(0.0);
  
  for (int s = 0; s < SAMPLES_PER_FRAME; s++) {
    vec2 offset = random2(vUv * uTime + vec2(float(s), uFrameCount));
    vec2 sampleUv = uv + offset / uResolution;
    
    vec3 rayDir = normalize(forward * focalLength + right * sampleUv.x + camUp * sampleUv.y);
    Ray ray = Ray(camPos, rayDir);
    
    color += tracePath(ray, vec3(vUv, uTime + float(s) + uFrameCount));
  }
  
  color /= float(SAMPLES_PER_FRAME);
  
  // Temporal accumulation
  vec3 prevColor = texture2D(uPreviousFrame, vUv * 0.5 + 0.5).rgb;
  if (uFrameCount > 0.0) {
    float weight = 1.0 / (uFrameCount + 1.0);
    color = mix(prevColor, color, weight);
  }
  
  // Tone mapping
  color = color / (color + vec3(1.0));
  color = pow(color, vec3(1.0 / 2.2));
  
  gl_FragColor = vec4(color, 1.0);
}
`;

export default function T46_PathTracing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rafRef = useRef<number>(0);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const frameCountRef = useRef(0);
  const renderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(1);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const w = container.clientWidth;
    const h = container.clientHeight;
    const renderTarget = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    });
    renderTargetRef.current = renderTarget;

    const quadGeo = new THREE.PlaneGeometry(2, 2);
    const quadMat = new THREE.ShaderMaterial({
      vertexShader: ptVertexShader,
      fragmentShader: ptFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(w, h) },
        uPreviousFrame: { value: renderTarget.texture },
        uFrameCount: { value: 0 },
      },
      depthWrite: false,
      depthTest: false,
    });
    materialRef.current = quadMat;

    const quad = new THREE.Mesh(quadGeo, quadMat);
    scene.add(quad);

    function animate() {
      rafRef.current = requestAnimationFrame(animate);
      frameCountRef.current += 1;

      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = performance.now() * 0.001;
        materialRef.current.uniforms.uFrameCount.value = Math.min(frameCountRef.current, 100);
        materialRef.current.uniforms.uPreviousFrame.value = renderTarget.texture;
      }

      renderer.setRenderTarget(renderTarget);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      renderer.setSize(nw, nh);
      if (materialRef.current) {
        materialRef.current.uniforms.uResolution.value.set(nw, nh);
      }
      renderTarget.setSize(nw, nh);
      frameCountRef.current = 0;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafRef.current);
      renderer.dispose();
      renderTarget.dispose();
      quadGeo.dispose();
      quadMat.dispose();
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
