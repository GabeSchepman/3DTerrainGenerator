import * as THREE from "three";

/**
 * Returns html canvas element with height values drawn to the canvas.
 * Higher values correspond to black and lower values to white.
 * @param {Float32Array} data - array of height values (range of [0, 1])
 * @param {int} width - width of map represented by data array
 * @param {int} height - height of map represented by data array
 * @returns {HTMLElement} canvas element with height values drawn as black and white
 */
export function generateTexture(data, width, height, regions) {

    // assign heightmap canvas element 
    let canvas = document.getElementById('heightmap');
    canvas.width = width;
    canvas.height = height;

    // we are rendering heightmap in 2D
    let context = canvas.getContext('2d');

    // create new image and get reference to its data array
    let image = context.createImageData(canvas.width, canvas.height);
    let d = image.data;

    // loop over each height value and adjust canvas color
    // for (let i = 0; i < height; i++) {
    //     for (let j = 0; j < width; j++) {
    //         // index for height data array
    //         let index = j + i * width;
    //         // index for image data (RGBA format)
    //         let dindex = index * 4
    //         d[dindex] = d[dindex + 1] = d[dindex + 2] = data[index] * 255; //rgb values set to grayscale value
    //         d[dindex + 3] = 255; // alpha value
    //     }
    // }
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            // index for height data array
            let index = j + i * width;
            // index for image data (RGBA format)
            let dindex = index * 4

            let currentHeight = data[index];
            for (let i = 0; i < regions.length; i++) {
                if (currentHeight <= regions[i].height) {
                    let color = new THREE.Color(regions[i].color);
                    d[dindex] = color.r * 255;
                    d[dindex + 1] = color.g * 255;
                    d[dindex + 2] = color.b * 255;
                    break;
                }
            }
            d[dindex + 3] = 255; // alpha value
        }
    }
    // assign image with adjusted data array to canvas element
    context.putImageData(image, 0, 0);

    return canvas;
}
