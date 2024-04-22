import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import XORShift64 from 'random-seedable/xorshift64.js';

const canvas = document.getElementById('bg');
const scene = new THREE.Scene();

const mapWidth = 100;
const mapHeight = 100;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(60);

const geometry = new THREE.PlaneGeometry(mapWidth, mapHeight, 50, 50);
geometry.rotateX(-Math.PI / 2)
const material = new THREE.MeshBasicMaterial({ color: 0xFF4763, wireframe: true });
const plane = new THREE.Mesh(geometry, material);
const data = generate2DNoiseMap(mapWidth, mapHeight, 1, 1, 0.5, 2, 0, 0, 1234567);
const vertices = geometry.attributes.position.array;
for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {

	vertices[j + 1] = data[i] * 10;

}


scene.add(plane);

const controls = new OrbitControls(camera, renderer.domElement);
function animate() {
	requestAnimationFrame(animate);

	controls.update();

	renderer.render(scene, camera);
}

animate();
console.log(generate2DNoiseMap(10, 10, 1, 1, 0.5, 2, 0, 0, 1234567))

function generate2DNoiseMap(mapWidth, mapHeight, scale, octaves, persistence, lacunarity, offsetX, offsetY, seed) {
	var noiseMap = new Float32Array(mapWidth * mapHeight);

	var prng = new XORShift64(seed)
	var octaveOffsets = new Int32Array(octaves * 2)
	for (let i = 0; i < octaves; i++) {
		var offX = prng.randRange(-10000, 10000) + offsetX;
		var offY = prng.randRange(-10000, 10000) + offsetY;
		octaveOffsets[i] = offX;
		octaveOffsets[i + 1] = offY;
	}
	console.log('OctaveOffsets: ' + octaveOffsets)

	var maxX = -9999999
	var minX = 9999999
	var maxY = -9999999
	var minY = 9999999
	var halfWidth = mapWidth / 2;
	var halfHeight = mapHeight / 2;
	const perlin = new ImprovedNoise();

	for (let y = 0; y < mapHeight; y++) {
		for (let x = 0; x < mapWidth; x++) {
			var amplitude = 1;
			var frequency = 1;
			var noiseHeight = 0;

			for (let i = 0; i < octaves; i++) {
				var sampleX = (x - halfWidth) / scale * frequency + octaveOffsets[i];
				var sampleY = (y - halfHeight) / scale * frequency + octaveOffsets[i + 1];

				if (sampleX > maxX) {
					maxX = sampleX;
				} else if (sampleX < minX) {
					minX = sampleX;
				}
				if (sampleY > maxY) {
					maxY = sampleY;
				} else if (sampleY < minY) {
					minY = sampleY;
				}
				sampleX = THREE.MathUtils.inverseLerp(minX, maxX, sampleX)
				sampleY = THREE.MathUtils.inverseLerp(minY, maxY, sampleY)
				console.log('sampleX: ' + sampleX)
				console.log('sampleY: ' + sampleY)
				var perlinValue = perlin.noise(sampleX, sampleY, prng.float()) * 2 - 1;
				console.log('Perlin Value: ' + perlinValue)
				noiseHeight += perlinValue * amplitude;
				console.log('noiseHeight: ' + noiseHeight)
				amplitude *= persistence;
				frequency *= lacunarity;
			}
			noiseMap[x + y * mapWidth] = noiseHeight;
		}
	}
	return noiseMap;
}