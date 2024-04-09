import * as THREE from 'https://unpkg.com/three/build/three.module.js';

//import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
const canvas = document.querySelector('.webgl');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
camera.position.setZ(30);

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshBasicMaterial({color: 0xFF4763, wireframe: true});
const torus = new THREE.Mesh(geometry, material);

scene.add(torus);

const controls = new OrbitControls(camera, renderer.domElement);
function animate(){
  requestAnimationFrame(animate);

  controls.update();

  renderer.render(scene, camera);
}

animate();