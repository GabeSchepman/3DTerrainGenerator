import * as THREE from "three";

export function generateTexture(data, width, height) {
    let canvas = document.getElementById('heightmap');
    canvas.width = width;
    canvas.height = height;
    let context = canvas.getContext('2d');
    let image = context.createImageData(canvas.width, canvas.height);
    let d = image.data;
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let index = j + i * width;
            let dindex = index * 4
            d[dindex] = d[dindex + 1] = d[dindex + 2] = data[index] * 255;
            d[dindex + 3] = 255;
        }
    }
    context.putImageData(image, 0, 0);
    return canvas;
}
