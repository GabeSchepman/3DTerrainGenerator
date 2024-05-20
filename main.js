import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import * as Noise from "noise";
import * as Texture from "texture";
import GUI from "gui";
import Stats from "stats";


// Terrain display and generation settings
const s = {
    mapSize: 2048,
    segments: 512,
    scale: 250,
    maxHeight: 100,
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2,
    offsetX: 0,
    offsetY: 0,
    seed: 12345,
    wireframe: false,
    lod: 0,
    heightFunc: 'heightPow'
};

let renderer, scene, camera, controls, stats, plane, light, geometry, data, detailIncrement;
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

init();
setupCamera();
setupGUI();
animate();

/**
 * Setup three.js camera parameters
*/
function setupCamera() {
    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(450, 450, 450);
    controls = new OrbitControls(camera, renderer.domElement);
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

function height(x) {
    return x
}

function heightPow(x) {
    return Math.pow(x, 5)
}

function heightRound(x) {
    return Math.round(x * 10) / 10
}

/**
 * Update the visuals of the terrain after any parameters are adjusted during rendering
*/
function updateTerrain() {
    scene.remove(plane);
    generatePlane();
    scene.add(plane);
}

function generatePlane() {
    s.heightFunc = eval(s.heightFunc);
    data = Noise.generate2DNoiseMap(
        s.segments,
        s.segments,
        s.scale,
        s.octaves,
        s.persistence,
        s.lacunarity,
        s.offsetX,
        s.offsetY,
        s.seed,
    );

    const texture = new THREE.CanvasTexture(Texture.generateTexture(data, s.segments, s.segments, regions));
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;

    let material;
    if (s.wireframe) {
        material = new THREE.MeshBasicMaterial({ map: texture, wireframe: s.wireframe });
    } else {
        material = new THREE.MeshLambertMaterial({ map: texture, flatShading: true });
    }

    // Plane vertex manipulation
    detailIncrement = (s.lod == 0) ? 1 : (s.lod * 2);
    geometry = new THREE.PlaneGeometry(s.segments, s.segments, (s.segments - 1) / (detailIncrement), (s.segments - 1) / (detailIncrement));
    plane = new THREE.Mesh(geometry, material);
    const pos = geometry.getAttribute("position");
    let vindex = 0;
    for (let y = 0; y < s.segments; y += detailIncrement) {
        for (let x = 0; x < s.segments; x += detailIncrement) {
            pos.setZ(vindex, s.heightFunc(data[x + y * s.segments]) * s.maxHeight);
            vindex++;
        }
    }
    return plane;
}

/**
 * Resize rendering anytime window is resized
*/
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

/**
 * Setup lilgui for real-time interactive adjustable parameters
*/
function setupGUI() {
    //const gui = new GUI({container: document.getElementById('gui_container')});
    const gui = new GUI();

    //gui.add(Settings, "mapSize").min(128).max(8192).step(128).onChange(() => updateTerrain());
    gui.add(s, "segments").min(16).max(1024).step(16).onChange(() => updateTerrain());
    gui.add(s, "scale").min(1).max(1000).step(5).onChange(() => updateTerrain());
    gui.add(s, "maxHeight").min(10).max(150).step(5).onChange(() => updateTerrain());
    gui.add(s, "octaves").min(1).max(16).step(1).onChange(() => updateTerrain());
    gui.add(s, "persistence").min(0.1).max(1).step(0.05).onChange(() => updateTerrain());
    gui.add(s, "lacunarity").min(1).max(2.5).step(0.1).onChange(() => updateTerrain());
    gui.add(s, "offsetX").min(-10).max(10).step(.1).onChange(() => updateTerrain());
    gui.add(s, "offsetY").min(-10).max(10).step(.1).onChange(() => updateTerrain());
    gui.add(s, "seed").min(1).max(999999).step(1).onChange(() => updateTerrain());
    gui.add(s, "wireframe").onChange(() => updateTerrain());
    gui.add(s, "lod").min(0).max(4).step(1).onChange(() => updateTerrain()).name('Level of Detail Simplification');
    gui.add(s, "heightFunc", ['height', 'heightPow', 'heightRound']).onChange(() => updateTerrain()).name('Height Function');
}

/**
 * Main animation loop ran every frame
*/
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    stats.update();
    plane.geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
    //console.log(camera.position)
    //console.log(renderer.info.render)
}

