import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createNoise2D } from 'simplex-noise';

console.log('booting up genesis prime...');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);


scene.fog = new THREE.FogExp2(0x87CEEB, 0.0008);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 500, 800);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const noise2D = createNoise2D();

const island_geo = new THREE.PlaneGeometry(2000, 2000, 256, 256);
island_geo.rotateX(-Math.PI / 2);
const pos_attr = island_geo.attributes.position;

for (let i = 0; i < pos_attr.count; i++) {
     const x = pos_attr.getX(i);
     const z = pos_attr.getZ(i);
     let h_val = noise2D(x * 0.005, z * 0.005) * 150 + noise2D(x * 0.01, z * 0.01) * 50 + noise2D(x * 0.05, z * 0.05) * 10;
     const dist = Math.sqrt(x * x + z * z);
        h_val -= Math.max(0, dist * 0.15);

        pos_attr.setY(i, h_val);
}
island_geo.computeVertexNormals();
const norm_attr = island_geo.attributes.normal;
const colors = [];
const color = new THREE.Color();

for (let i = 0; i < pos_attr.count; i++) {
const y = pos_attr.getY(i);
const ny = norm_attr.getY(i);
const slope = Math.acos(ny) * (180 / Math.PI);

if (slope > 30) {
    color.setHex(0x555555);
} else if (y<5) {
    color.setHex(0xf2d2a9);
} else if (y < 100) {
    color.setHex(0xffffff);
} else {
    color.setHex(0x1a4a1a);
}
colors.push(color.r, color.g, color.b);
}
island_geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

const terrainMesh = new THREE.Mesh(
    island_geo,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8})
);
terrainMesh.castShadow = true;
terrainMesh.receiveShadow = true;
scene.add(terrainMesh);

const water_geo = new THREE.PlaneGeometry(4000, 4000);
water_geo.rotateX(-Math.PI / 2);
const water_mat = new THREE.MeshStandardMaterial({
    color: 0x0066ff,
    transparent: true,
    opacity: 0.8,
    roughness: 0.1,
    metalness: 0.8,
});
const water_thing = new THREE.Mesh(water_geo, water_mat);
water_thing.position.y = 2;
water_thing.receiveShadow = true;
scene.add(water_thing);


const sunLight = new THREE.DirectionalLight(0xfffff,1.5);
sunLight.position.set(500,1000,200);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 4096;
sunLight.shadow.mapSize.height = 4096;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 3000;
sunLight.shadow.camera.left = -1000;
sunLight.shadow.camera.right = 1000;
sunLight.shadow.camera.top = 1000;
sunLight.shadow.camera.bottom = -1000;
scene.add(sunLight);

const ambientSky = new THREE.HemisphereLight(0x87CEEB, 0x1a4a1a, 0.6);
scene.add(ambientSky);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();