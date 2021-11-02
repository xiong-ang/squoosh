async function loadFile(src) {
    const resp = await fetch(src);
    return await resp.arrayBuffer();
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

const defaultEncoderOptions = {
    quality: 75,
    baseline: false,
    arithmetic: false,
    progressive: true,
    optimize_coding: true,
    smoothing: 0,
    color_space: 3 /*YCbCr*/,
    quant_table: 3,
    trellis_multipass: false,
    trellis_opt_zero: false,
    trellis_opt_table: false,
    trellis_loops: 1,
    auto_subsample: true,
    chroma_subsample: 2,
    separate_chroma_quality: false,
    chroma_quality: 75,
};

const image = await loadFile('./example.jpg');
console.log('size before compression: ', image.byteLength);

//encode image
const jpegImage = await loadImage('./example.jpg');

//show decoded images
const img = document.createElement('img');
img.src = getImageDataUrl(jpegImage);
document.body.appendChild(img);

const {default: mozjpeg_enc} = await import('./mozjpeg/enc/mozjpeg_enc.js');
//import mozjpeg_enc from './mozjpeg/enc/mozjpeg_enc.js';
const mozjpegEnc = await mozjpeg_enc({ noInitialRun: true });
const result = mozjpegEnc.encode(jpegImage.data, jpegImage.width, jpegImage.height, defaultEncoderOptions);
console.log('size after compression: ', result.length);

saveAs(new Blob([result]), "test.jpg");