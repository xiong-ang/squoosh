async function loadFile(src) {
    const resp = await fetch(src);
    return await resp.arrayBuffer();
}

async function blobToArrayBuffer(blob) {
    return await new Response(blob).arrayBuffer();
}

async function loadImage(src) {
    // Load image
    const img = document.createElement('img');
    img.src = src;
    await new Promise(resolve => img.onload = resolve);
    // Make canvas same size as image
    const canvas = document.createElement('canvas');
    [canvas.width, canvas.height] = [img.width, img.height];
    // Draw image onto canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, img.width, img.height);
}

function getImageDataUrl(imageData) {
    const canvas = document.createElement('canvas');
    [canvas.width, canvas.height] = [imageData.width, imageData.height];
    canvas.getContext('2d').putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/jpeg");
}

const defaultOptions = {
    numColors: 255,
    dither: 1.0,
};

const defaultEncoderOptions = {
    level: 2,
};

const imageArrayBuffer = await loadFile('./example.png');
console.log('size before compression: ', imageArrayBuffer.byteLength);

// decode image
const imageData = await loadImage('./example.png');

//show decoded images
const img = document.createElement('img');
img.src = getImageDataUrl(imageData);
document.body.appendChild(img);

//quantize images
const { default: quantize_init } = await import('./imagequant/imagequant.js');
const imageQuant = await quantize_init();
const quantizeResult = imageQuant.quantize(imageData.data, imageData.width, imageData.height, defaultOptions.numColors, defaultOptions.dither);

//encode image
const { default: encDec_init, encode } = await import('./png/pkg/squoosh_png.js');
await encDec_init();
const encodeResult = encode(quantizeResult, imageData.width, imageData.height);

//optimise image
const { default: init, optimise } = await import('./oxipng/pkg/squoosh_oxipng.js');
await init();
let result = optimise(encodeResult/*new Uint8Array(imageArrayBuffer)*/, defaultEncoderOptions.level, false)
console.log('size after compression: ', result.length);

saveAs(new Blob([result]), "test.png");
