import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const canvas = document.getElementById('bg');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

const geometry = new THREE.PlaneGeometry(500, 500, 50, 50);
const material = new THREE.MeshBasicMaterial({color: 0xFF4763, wireframe: true});
const plane = new THREE.Mesh(geometry, material);

scene.add(plane);

const controls = new OrbitControls(camera, renderer.domElement);
function animate(){
  requestAnimationFrame(animate);

  controls.update();

  renderer.render(scene, camera);
}

animate();