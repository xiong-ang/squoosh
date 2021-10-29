async function loadFile(src) {
    const resp = await fetch(src);
    return await resp.arrayBuffer();
}

const defaultEncoderOptions = {
    level: 2,
};

const imageArrayBuffer = await loadFile('./example.png');
console.log('size before compression: ', imageArrayBuffer.byteLength);

const { default: init, optimise } = await import('./oxipng/pkg/squoosh_oxipng.js');
await init();
let result = optimise(new Uint8Array(imageArrayBuffer), defaultEncoderOptions.level, false)


console.log('size after compression: ', result.length);
const blob = new Blob([result], { type: 'image/png' });
const blobURL = URL.createObjectURL(blob);
const img = document.createElement('img');
img.src = blobURL;
document.body.appendChild(img);
