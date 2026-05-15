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


const treeGroup = new THREE.Group();
const bark = new THREE.MeshStandardMaterial({ color: 0x3d2817 });
const leaves = new THREE.MeshStandardMaterial({ color: 0x0f30f0 });

for (let i=0; i<150; i++) {
    const x = (Math.random() - 0.5) * 1800;
    const z = (Math.random() - 0.5) * 1800;


let  h = noise2D(x * 0.005, z * 0.005) * 150 + noise2D(x * 0.01, z * 0.01) * 50 + noise2D(x * 0.05, z * 0.05) * 10 - Math.max(0, Math.sqrt(x*x + z*z) * 0.15);
    
if (h > 10 && h < 90) {
    const tree = new THREE.Group();
    const trunk = new  THREE.Mesh(new THREE.CylinderGeometry(2, 2, 10), bark);
    trunk.position.y = 5;
    trunk.castShadow = true;

    const top1 = new THREE.Mesh(new THREE.ConeGeometry(8, 20), leaves);
    top1.position.y = 15;
    top1.castShadow = true;

    tree.add(trunk);
    tree.add(top1);
    tree.position.set(x, h, z);
    treeGroup.add(tree);
}
}
scene.add(treeGroup);

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


const tribeGroup = new THREE.Group();
const skinMat = new THREE.MeshStandardMaterial({ color: 0xffcc99 });
const shirtMat = new THREE.MeshStandardMaterial({ color: 0xcc2222 });

for (let i =0; i < 60; i++) {
    const tx = (Math.random() - 0.5) * 1200;
    const tz = (Math.random() - 0.5) * 1200;


let th = noise2D(tx * 0.005, tz * 0.005) * 150 + noise2D(tx * 0.01, tz * 0.01) * 50 + noise2D(tx * 0.05, tz * 0.05) * 10 - Math.max(0, Math.sqrt(tx*tx + tz*tz) * 0.15);


if (th > 3 && th < 40) {
const dude = new THREE.Group();
const body = new THREE.BatchedMesh(new THREE.BoxGeometry(2,3,2), shirtMat);
body.position.y = 1.5;
body.castShadow = true;

const head = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), skinMat);
head.position.y = 4;
head.castShadow = true;

dude.add(body);
dude.add(head);
dude.position.set(tx, th, tz);

dude.rotation.y = Math.random() * Math.PI * 2;
tribeGroup.add(dude);
}
}
scene.add(tribeGroup);


const villageGroup = new THREE.Group();
const houseMat = new THREE.MeshStandardMaterial({ color: 0xddddcc, roughness: 1.0});
const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 });

for (let i = 0; i < 25; i++) {
    const hx = (Math.random() - 0.5) * 1000;
    const hz = (Math.random() - 0.5) * 1000;

let hh = noise2D(hx * 0.005, hz * 0.005) * 150 + noise2D(hx * 0.01, hz * 0.01) * 50 + noise2D(hx * 0.05, hz * 0.05) * 10 - Math.max(0, Math.sqrt(hx*hx + hz*hz) * 0.15);


if (hh > 5 && hh < 60) {
    const house = new THREE.Group();
   
    const base = new THREE.Mesh(new THREE.BoxGeometry(10, 8, 10), houseMat);
    base.position.y = 4;
    base.castShadow = true;
    base.receiveShadow = true;

    const roof = new THREE.Mesh(new THREE.ConeGeometry(8, 6, 4), roofMat);
    roof.position.y = 11;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;

    house.add(base);
    house.add(roof);
    house.position.set(hx, hh, hz);
    villageGroup.add(house);
}
}
scene.add(villageGroup);

const boatGroup = new THREE.Group();
const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
const sailMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, side: THREE.DoubleSide });

const boats = [];

for (let i = 0; i < 30; i++) {
  const bx = (Math.random() - 0.5) * 3000;
const bz = (Math.random() - 0.5) * 3000;

let bh = noise2D(bx * 0.005, bz * 0.005) * 150 + noise2D(bx * 0.01, bz * 0.01) * 50 + noise2D(bx * 0.05, bz * 0.05) * 10 - Math.max(0, Math.sqrt(bx*bx + bz*bz) * 0.15);


if (bh < -20) {
   const boat = new THREE.Group();
   const hull = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 14), woodMat);
   hull.position.y = 1.5;
    hull.castShadow = true;
    const sail = new THREE.Mesh(new THREE.ConeGeometry(5, 12, 3), sailMat);
    sail.position.y = 9;
    sail.position.z = -2;
    sail.castShadow = true;

    boat.add(hull);
    boat.add(sail);
    boat.position.set(bx, 2 , bz);
    boat.rotation.y = Math.random() * Math.PI * 2;
    boatGroup.add(boat);

    boats.push({ mesh: boat, speed: Math.random() * 0.5 + 0.1 });
}
}
scene.add(boatGroup);



const animalGroup = new THREE.Group();
const animalMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
const animals = [];

for (let i = 0; i < 40; i++) {
   const ax = (Math.random() - 0.5) * 1200;
   const az = (Math.random() - 0.5) * 1200;
 
   let ah = noise2D(ax * 0.005, az * 0.005) * 150 + noise2D(ax * 0.01, az * 0.01) * 50 + noise2D(ax * 0.05, az * 0.05) * 10 - Math.max(0, Math.sqrt(ax*ax + az*az) * 0.15);


if (ah > 5 && ah < 70) {
  const animal = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 4), animalMat);
    animal.position.set(ax,ah,az);
    animal.castShadow = true;
    animalGroup.add(animal);

   animals.push({
    mesh: animal,
    speed: Math.random() * 0.2 + 0.05,
    turnSpeed: (Math.random() - 0.5) * 0.05
   });
}
}
scene.add(animalGroup);

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
   
   const time = clock.getElapsedTime();
   water_thing.position.y = 2 + Math.sin(time) * 3.0;
   
  
  boats.forEach(b => {
     b.mesh.translateZ(-b.speed);
     b.mesh.position.y = 2 + Math.sin(time * 2 + b.mesh.position.x * 0.01) * 1.5;
  });
  
  
   controls.update();
    renderer.render(scene, camera);
}
animate();