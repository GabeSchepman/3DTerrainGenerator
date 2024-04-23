import * as THREE from "/libs/three.module.js";
import { OrbitControls } from "/libs/OrbitControls.js";
import * as Noise from "./NoiseGen.js";
import * as Texture from "./TextureGen.js";

let renderer, scene, camera, controls;

const mapWidth = 100;
const mapHeight = 100;
const scale = 25;
const octaves = 4;
const persistence = 0.5;
const lacunarity = 2;
const offsetX = 0;
const offsetY = 0;
const seed = 12345;

init();
animate();

function init() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("bg"), antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(600, 600, 0);

    const data = Noise.generate2DNoiseMap(mapWidth, mapHeight, scale, octaves, persistence, lacunarity, offsetX, offsetY, seed);

    const geometry = new THREE.PlaneGeometry(1000, 1000, mapWidth - 1, mapHeight - 1);
    geometry.rotateX(-Math.PI / 2);

    const texture = new THREE.CanvasTexture(Texture.generateTexture(data, mapWidth, mapHeight));
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const plane = new THREE.Mesh(geometry, material);
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < data.length; i++) {
        vertices[i * 3 + 1] = data[i] * 250;
    }

    scene.add(plane);

    controls = new OrbitControls(camera, renderer.domElement);
}

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);
}

function setupGUI() {}
