async function loadFile(src) {
    const resp = await fetch(src);
    return await resp.arrayBuffer();
}

function getImageDataUrl(imageData) {
    const canvas = document.createElement('canvas');
    [canvas.width, canvas.height] = [imageData.width, imageData.height];
    canvas.getContext('2d').putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/jpeg");
}

function resizeNameToIndex(name) {
    switch (name) {
        case 'triangle':
            return 0;
        case 'catrom':
            return 1;
        case 'mitchell':
            return 2;
        case 'lanczos3':
            return 3;
        default:
            throw Error(`Unknown resize algorithm "${name}"`);
    }
}

const defaultEncoderOptions = {
    cqLevel: 33,
    cqAlphaLevel: -1,
    denoiseLevel: 0,
    tileColsLog2: 0,
    tileRowsLog2: 0,
    speed: 6,
    subsample: 1,
    chromaDeltaQ: false,
    sharpness: 0,
    tune: 0 /* AVIFTune.auto */,
};

const image = await loadFile('./example.avif');
console.log('size before compression: ', image.byteLength);

const { default: avif_dec } = await import('./avif/dec/avif_dec.js');
//import avif_dec from './avif/dec/avif_dec.js';
const avifDec = await avif_dec({ noInitialRun: true });
const imageData = avifDec.decode(image);

//show decoded images
const img = document.createElement('img');
img.src = getImageDataUrl(imageData);
document.body.appendChild(img);

//resize
const resizeDefaultOptions = {
    method: 'lanczos3',
    fitMethod: 'stretch',
    premultiply: true,
    linearRGB: true,
};
const { default: resize_init, resize } = await import('./resize/pkg/squoosh_resize.js');
await resize_init();
const resizedImageWidth = 100;
const resizedImageHeight = 100;
const resizedImageData = resize(
    imageData.data,
    imageData.width,
    imageData.height,
    resizedImageWidth,
    resizedImageHeight,
    resizeNameToIndex(resizeDefaultOptions.method),
    resizeDefaultOptions.premultiply,
    resizeDefaultOptions.linearRGB,
);


const { default: avif_enc } = await import('./avif/enc/avif_enc.js');
//import avif_enc from './avif/enc/avif_enc.js';
const avifEnc = await avif_enc({ noInitialRun: true });
const result = avifEnc.encode(resizedImageData, resizedImageWidth, resizedImageHeight, defaultEncoderOptions);
console.log('size after compression: ', result.length);

// save avif image
// const { default: saveAs } = await import('./fileSaver.js');
// const {saveAs} = await import('./fileSaver.js');
// import saveAs from './fileSaver.js';
saveAs(new Blob([result]), "test.avif");