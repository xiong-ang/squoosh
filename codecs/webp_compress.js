async function loadFile(src) {
    const resp = await fetch(src);
    return await resp.arrayBuffer();
}

const defaultEncoderOptions = {
    quality: 75,
    target_size: 0,
    target_PSNR: 0,
    method: 4,
    sns_strength: 50,
    filter_strength: 60,
    filter_sharpness: 0,
    filter_type: 1,
    partitions: 0,
    segments: 4,
    pass: 1,
    show_compressed: 0,
    preprocessing: 0,
    autofilter: 0,
    partition_limit: 0,
    alpha_compression: 1,
    alpha_filtering: 1,
    alpha_quality: 100,
    lossless: 0,
    exact: 0,
    image_hint: 0,
    emulate_jpeg_size: 0,
    thread_level: 0,
    low_memory: 0,
    near_lossless: 100,
    use_delta_palette: 0,
    use_sharp_yuv: 0,
};

const image = await loadFile('./example.webp');
console.log('size before compression: ', image.byteLength);

const { default: webp_dec_init } = await import('./webp/dec/webp_dec.js');
//import webp_dec_init from './webp/dec/webp_dec.js';
const webpDecModule = await webp_dec_init();
//console.log('Version:', webpDecModule.version().toString(16));
const imageData = webpDecModule.decode(image);

const { default: webp_enc_init } = await import('./webp/enc/webp_enc.js');
//import webp_enc_init from './webp/enc/webp_enc.js';
const webpEncModule = await webp_enc_init();
const result = webpEncModule.encode(imageData.data, imageData.width, imageData.height, defaultEncoderOptions);
console.log('size after compression: ', result.length);
const blob = new Blob([result], { type: 'image/webp' });

const blobURL = URL.createObjectURL(blob);
const img = document.createElement('img');
img.src = blobURL;
document.body.appendChild(img);