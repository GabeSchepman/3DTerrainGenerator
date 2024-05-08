import * as THREE from "three";
import { SimplexNoise } from "SimplexNoise";
import XORShift64 from "XORShift64";

/**
 * Returns an 1D array containing all noise height values generated using simplex noise
 * @param {int} mapWidth - width of noise map chunk
 * @param {int} mapHeight - height of noise map chunk
 * @param {int} scale - scale factor (acts as a zoom factor into the noise)
 * @param {int} octaves - how many layers to use for noise (increases detail based on persistence and lacunarity)
 * @param {int} persistence - value to scale amplitude of noise by for each layer (should be < 1)
 * @param {int} lacunarity - value to scale frequency of noise by for each layer (should be > 1)
 * @param {int} offsetX - offset x value to be able to 'scroll' through the noise
 * @param {int} offsetY - offset y value to be able to 'scroll' through the noise
 * @param {int} seed - seed to be able to obtain unique generation again
 * @returns {Float32Array} array containing all noise height values
 */
export function generate2DNoiseMap(mapWidth, mapHeight, scale, octaves, persistence, lacunarity, offsetX, offsetY, seed) {

    // Noise map data array for holding all noise height values
    const noiseMap = new Float32Array(mapWidth * mapHeight);

    // seeded random number generator
    const prng = new XORShift64(seed);

    // Generate random offsets for each octave. Having each octave randomly offset helps 
    // keep the sample values taken from each octave independent from eachother
    const octaveOffsets = new Int32Array(octaves * 2);
    for (let i = 0; i < octaves; i++) {
        const offX = prng.randRange(-100000, 100000) + offsetX;
        const offY = prng.randRange(-100000, 100000) + offsetY;
        octaveOffsets[i * 2] = offX;
        octaveOffsets[i * 2 + 1] = offY;
    }

    // max and min to keep track of max and min height values generated
    let maxNoiseHeight = -Infinity;
    let minNoiseHeight = Infinity;

    // coordinates for center of map
    const halfWidth = mapWidth / 2.0;
    const halfHeight = mapHeight / 2.0;

    // simplex noise generator with seeded random number generator 
    const simplex = new SimplexNoise(prng);

    // loop over every point in the noise map
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {

            let amplitude = 1;      // affects upper limit of height values
            let frequency = 2.5;    // affects how quickly neighboring values change
            let noiseHeight = 0;    // height value to be adjusted over each octave

            // loop over each octave layer
            for (let i = 0; i < octaves; i++) {

                // sample x and y values to base noise value generation on
                const sampleX = ((x - halfWidth) / scale * frequency) + octaveOffsets[i * 2];
                const sampleY = ((y - halfHeight) / scale * frequency) + octaveOffsets[i * 2 + 1];

                const noiseValue = simplex.noise(sampleX, sampleY);

                // assign height value
                noiseHeight += noiseValue * amplitude;

                /* amplitude decreases each octave loop, effectively decreasing current octave affect on final value.
                 * frequency increases each octave loop, effectively increasing how detailed current octave is.
                 * Analogy: first octave outlines big features such as mountains, second octave outlines medium features such as boulders,
                 * third octave outlines small features such as rocks. */
                amplitude *= persistence;
                frequency *= lacunarity;
            }

            // check and adjust min/max values for each value
            if (noiseHeight > maxNoiseHeight) {
                maxNoiseHeight = noiseHeight;
            } else if (noiseHeight < minNoiseHeight) {
                minNoiseHeight = noiseHeight;
            }

            // assign height value to data array
            noiseMap[x + y * mapWidth] = noiseHeight;
        }
    }

    // normalize height values to be in range [0, 1]
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            let index = x + y * mapWidth;
            noiseMap[index] = THREE.MathUtils.inverseLerp(minNoiseHeight, maxNoiseHeight, noiseMap[index]);
        }
    }
    console.log(noiseMap);
    return noiseMap;
}
