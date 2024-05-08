import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import * as Noise from "noise";
import * as Texture from "texture";
import GUI from "gui";
import Stats from "stats";

// Terrain display and generation settings
const Settings = {
    mapSize: 8192,
    segments: 512,
    scale: 250,
    maxHeight: 220,
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2,
    offsetX: 0,
    offsetY: 0,
    seed: 12345,
    wireframe: false
};

let renderer, scene, camera, controls, stats, plane, light;
let regions = [
    {
        name: 'water',
        color: 'blue',
        height: 0.4
    },
    {
        name: 'sand',
        color: 'yellow',
        height: 0.45
    },
    {
        name: 'grass',
        color: 'green',
        height: 0.6
    },
    {
        name: 'rock',
        color: 'saddlebrown',
        height: 0.85
    },
    {
        name: 'snow',
        color: 'white',
        height: 1
    }

];

/**
 * Setup three.js camera parameters
*/
function setupCamera() {
    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(450, 450, 450);
    controls = new OrbitControls(camera, renderer.domElement);
}

/**
 * Setup lilgui for real-time interactive adjustable parameters
*/
function setupGUI() {
    //const gui = new GUI({container: document.getElementById('gui_container')});
    const gui = new GUI();

    gui.add(Settings, "mapSize").min(128).max(8192).step(128).onChange(() => updateTerrain());
    gui.add(Settings, "segments").min(16).max(1024).step(16).onChange(() => updateTerrain());
    gui.add(Settings, "scale").min(1).max(1000).step(5).onChange(() => updateTerrain());
    gui.add(Settings, "maxHeight").min(10).max(1000).step(5).onChange(() => updateTerrain());
    gui.add(Settings, "octaves").min(1).max(16).step(1).onChange(() => updateTerrain());
    gui.add(Settings, "persistence").min(0.1).max(1).step(0.05).onChange(() => updateTerrain());
    gui.add(Settings, "lacunarity").min(1).max(2.5).step(0.1).onChange(() => updateTerrain());
    gui.add(Settings, "offsetX").min(0).max(10).step(1).onChange(() => updateTerrain());
    gui.add(Settings, "offsetY").min(0).max(10).step(1).onChange(() => updateTerrain());
    gui.add(Settings, "seed").min(1).max(999999).step(1).onChange(() => updateTerrain());
    gui.add(Settings, "wireframe").onChange(() => updateTerrain());
}

/**
 * Initial rendering setup
*/
function init() {
    scene = new THREE.Scene();
    scene.rotateX(-Math.PI / 2);
    light = new THREE.DirectionalLight(0xffffff, 10);
    light.position.set(1, 0, 1);
    scene.add(light);

    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById("bg"),
        antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    generatePlane();
    scene.add(plane);

    window.addEventListener("resize", onWindowResize);

    stats = new Stats();
    stats.domElement.style.position = "absolute";
    stats.domElement.style.left = "20px";
    stats.domElement.style.top = "160px";
    document.body.appendChild(stats.domElement);
}

/**
 * Main animation loop ran every frame
*/
function animate() {
    requestAnimationFrame(animate);

    controls.update();
    stats.update();
    renderer.render(scene, camera);
    //console.log(camera.position)
    //console.log(renderer.info.render)
}

/**
 * Update the visuals of the terrain after any parameters are adjusted during rendering
*/
function updateTerrain() {
    scene.remove(plane);
    plane = generatePlane();
    scene.add(plane);
}

function generatePlane() {
    const data = Noise.generate2DNoiseMap(
        Settings.segments,
        Settings.segments,
        Settings.scale,
        Settings.octaves,
        Settings.persistence,
        Settings.lacunarity,
        Settings.offsetX,
        Settings.offsetY,
        Settings.seed,
    );
    const geometry = new THREE.PlaneGeometry(Settings.mapSize, Settings.mapSize, Settings.segments - 1, Settings.segments - 1);

    const texture = new THREE.CanvasTexture(Texture.generateTexture(data, Settings.segments, Settings.segments, regions));
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;

    const material = new THREE.MeshLambertMaterial({ map: texture, wireframe: Settings.wireframe, flatShading: true });
    plane = new THREE.Mesh(geometry, material);
    let pos = geometry.getAttribute("position");
    for (let i = 0; i < data.length; i++) {
        pos.setZ(i, Math.pow(data[i], 4) * Settings.maxHeight);
    }
    geometry.setAttribute("position", pos);
    geometry.computeVertexNormals();
    geometry.normalsNeedUpdate = true;
    return plane;
}

/**
 * Resize rendering anytime window is resized
 */
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
