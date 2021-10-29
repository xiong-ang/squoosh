async function loadFile(src) {
    const resp = await fetch(src);
    return await resp.arrayBuffer();
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

const { default: avif_enc } = await import('./avif/enc/avif_enc.js');
//import avif_enc from './avif/enc/avif_enc.js';
const avifEnc = await avif_enc({ noInitialRun: true });
const result = avifEnc.encode(imageData.data, imageData.width, imageData.height, defaultEncoderOptions);
console.log('size after compression: ', result.length);
const blob = new Blob([result], { type: 'image/avif' });

const blobURL = URL.createObjectURL(blob);
const img = document.createElement('img');
img.src = blobURL;
document.body.appendChild(img);