import * as THREE from "three";
import { SimplexNoise } from "SimplexNoise";
import XORShift64 from "XORShift64";

export function generate2DNoiseMap(mapWidth, mapHeight, scale, octaves, persistence, lacunarity, offsetX, offsetY, seed) {
    const noiseMap = new Float32Array(mapWidth * mapHeight);

    const prng = new XORShift64(seed);
    const octaveOffsets = new Int32Array(octaves*2);
    for (let i = 0; i < octaves; i++) {
        const offX = prng.randRange(-100000, 100000) + offsetX;
        const offY = prng.randRange(-100000, 100000) + offsetY;
        octaveOffsets[i*2] = offX;
        octaveOffsets[i*2 + 1] = offY;
    }

    let maxNoiseHeight = -Infinity;
    let minNoiseHeight = Infinity;
    const halfWidth = mapWidth / 2.0;
    const halfHeight = mapHeight / 2.0;
    const simplex = new SimplexNoise(prng);
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            let amplitude = 1;
            let frequency = 2.5;
            let noiseHeight = 0;

            for (let i = 0; i < octaves; i++) {
                const sampleX = ((x - halfWidth) / (scale * frequency)) + octaveOffsets[i*2];
                const sampleY = ((y - halfHeight) / (scale * frequency)) + octaveOffsets[i*2 + 1];
                const noiseValue = simplex.noise(sampleX, sampleY);

                noiseHeight += noiseValue * amplitude;

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
            let index = x + y * mapWidth;
            noiseMap[index] = THREE.MathUtils.inverseLerp(minNoiseHeight, maxNoiseHeight, noiseMap[index]);
        }
    }
    return noiseMap;
}
