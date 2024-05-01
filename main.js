import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import * as Noise from "noise";
import * as Texture from "texture";
import GUI from "gui";



const Settings = {
    mapSize: 8192,
    segments: 512,
    scale: 10,
    maxHeight: 220,
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2,
    offsetX: 0,
    offsetY: 0,
    seed: 12345,
};

let renderer, scene, camera, controls;
let plane;

function setupCamera() {
    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(450, 450, 450);
    controls = new OrbitControls(camera, renderer.domElement);
}

function init() {
    scene = new THREE.Scene();
    scene.rotateX(-Math.PI / 2);

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("bg"), antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const data = Noise.generate2DNoiseMap(
        Settings.segments,
        Settings.segments,
        Settings.scale,
        Settings.octaves,
        Settings.persistence,
        Settings.lacunarity,
        Settings.offsetX,
        Settings.offsetY,
        Settings.seed
    );
    const geometry = new THREE.PlaneGeometry(Settings.mapSize, Settings.mapSize, Settings.segments - 1, Settings.segments - 1);

    const texture = new THREE.CanvasTexture(Texture.generateTexture(data, Settings.segments, Settings.segments));
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;

    const material = new THREE.MeshBasicMaterial({ map: texture });
    plane = new THREE.Mesh(geometry, material);
    let pos = geometry.getAttribute('position');
    for (let i = 0; i < data.length; i++) {
        pos.setZ(i, Math.pow(data[i], 5) * Settings.maxHeight);
    }
    geometry.setAttribute('position', pos);
    scene.add(plane);

    window.addEventListener('resize', onWindowResize);
}

function animate() {
    requestAnimationFrame(animate);

    controls.update();
    //console.log(camera.position)
    renderer.render(scene, camera);
}

function setupGUI() {
    const gui = new GUI();
    gui.add(Settings, "mapSize").min(10).max(2048).step(128).onChange(() => updateTerrain());
    gui.add(Settings, "segments").min(16).max(512).step(16).onChange(() => updateTerrain());
    gui.add(Settings, "scale").min(1).max(100).step(5).onChange(() => updateTerrain());
    gui.add(Settings, "maxHeight").min(10).max(1000).step(5).onChange(() => updateTerrain());
    gui.add(Settings, "octaves").min(1).max(16).step(1).onChange(() => updateTerrain());
    gui.add(Settings, "persistence").min(0.1).max(1).step(0.05).onChange(() => updateTerrain());
    gui.add(Settings, "lacunarity").min(2).max(16).step(1).onChange(() => updateTerrain());
    gui.add(Settings, "offsetX").min(0).max(10).step(1).onChange(() => updateTerrain());
    gui.add(Settings, "offsetY").min(0).max(10).step(1).onChange(() => updateTerrain());
    gui.add(Settings, "seed").min(1).max(999999).step(1).onChange(() => updateTerrain());
}

function updateTerrain() {
    scene.remove(plane);
    const data = Noise.generate2DNoiseMap(
        Settings.segments,
        Settings.segments,
        Settings.scale,
        Settings.octaves,
        Settings.persistence,
        Settings.lacunarity,
        Settings.offsetX,
        Settings.offsetY,
        Settings.seed
    );
    const geometry = new THREE.PlaneGeometry(Settings.mapSize, Settings.mapSize, Settings.segments - 1, Settings.segments - 1);

    const texture = new THREE.CanvasTexture(Texture.generateTexture(data, Settings.segments, Settings.segments));
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;

    const material = new THREE.MeshBasicMaterial({ map: texture });
    plane = new THREE.Mesh(geometry, material);
    let pos = geometry.getAttribute('position');
    for (let i = 0; i < data.length; i++) {
        pos.setZ(i, Math.pow(data[i], 4) * Settings.maxHeight);
    }
    geometry.setAttribute('position', pos);
    scene.add(plane);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    controls.handleResize();

}

init();
setupCamera();
setupGUI();
animate();