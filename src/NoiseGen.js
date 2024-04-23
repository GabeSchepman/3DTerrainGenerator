import * as THREE from 'three';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
import XORShift64 from 'random-seedable/xorshift64.js';

/**
 * 
 * @param {*} mapWidth 
 * @param {*} mapHeight 
 * @param {*} scale 
 * @param {*} octaves 
 * @param {*} persistence 
 * @param {*} lacunarity 
 * @param {*} offsetX 
 * @param {*} offsetY 
 * @param {*} seed 
 * @returns 
 */
export function generate2DNoiseMap(mapWidth, mapHeight, scale, octaves, persistence, lacunarity, offsetX, offsetY, seed) {
	const noiseMap = new Float32Array(mapWidth * mapHeight);

	const prng = new XORShift64(seed)
	const octaveOffsets = new Int32Array(octaves * 2)
	for (let i = 0; i < octaves; i++) {
		const offX = prng.randRange(-100000, 100000) + offsetX;
		const offY = prng.randRange(-100000, 100000) + offsetY;
		octaveOffsets[i] = offX;
		octaveOffsets[i + 1] = offY;
	}

	let maxNoiseHeight = -Infinity
	let minNoiseHeight = Infinity
	const halfWidth = mapWidth / 2;
	const halfHeight = mapHeight / 2;
	const simplex = new SimplexNoise();

	for (let y = 0; y < mapHeight; y++) {
		for (let x = 0; x < mapWidth; x++) {
			let amplitude = 1;
			let frequency = 1;
			let noiseHeight = 0;

			for (let i = 0; i < octaves; i++) {
				const sampleX = (x - halfWidth) / scale * frequency + octaveOffsets[i];
				const sampleY = (y - halfHeight) / scale * frequency + octaveOffsets[i + 1];

				const perlinValue = simplex.noise(sampleX, sampleY);

				noiseHeight += perlinValue * amplitude;

				amplitude *= persistence;
				frequency *= lacunarity;
			}
			if (noiseHeight > maxNoiseHeight) {
				maxNoiseHeight = noiseHeight;
			} else if (noiseHeight < minNoiseHeight) {
				minNoiseHeight = noiseHeight;
			}
			noiseMap[x + y * mapWidth] = noiseHeight;
		}
	}
	for (let y = 0; y < mapHeight; y++) {
		for (let x = 0; x < mapWidth; x++) {
			noiseMap[x + y * mapWidth] = THREE.MathUtils.inverseLerp(minNoiseHeight, maxNoiseHeight, noiseMap[x + y * mapWidth]);
		}
	}
	return noiseMap;
}