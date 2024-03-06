import ImageLayer from 'ol/layer/Image';
import ImageSource from 'ol/source/Image';
import { createCanvasContext2D } from 'ol/dom';
import { fromArrayBuffer } from 'geotiff'; // Update this line

const readGeoTIFF = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const arrayBuffer = event.target.result;
                const tiff = await fromArrayBuffer(arrayBuffer); // Update this line
                resolve(tiff);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsArrayBuffer(file);
    });
};

const createImageLayer = (data, size, extent, projection) => {
    const canvas = createCanvasContext2D(size[0], size[1]);
    const imageData = canvas.createImageData(size[0], size[1]);
    imageData.data.set(data.flat());
    canvas.putImageData(imageData, 0, 0);

    return new ImageLayer({
        source: new ImageSource({
            imageExtent: extent,
            projection: projection,
            imageFunction: function (extent, resolution, pixelRatio, size, projection) {
                const image = new Image();
                image.src = canvas.canvas.toDataURL('image/png');
                return image;
            },
        }),
    });
};

const addGeoTIFFLayer = async (file, map) => {
    try {
        const response = await fetch(file);
        const arrayBuffer = await response.arrayBuffer();
        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        const data = await image.readRasters();
        const size = image.getImage().size;
        const extent = image.getBoundingBox();
        const projection = image.getProjection();

        const imageLayer = createImageLayer(data, size, extent, projection);
        map.addLayer(imageLayer);
    } catch (error) {
        console.error('Error adding GeoTIFF layer:', error);
    }
};

const handleFileSelect = async (event, map) => {
    const file = event.target.files[0];
    if (!file) return;

    await addGeoTIFFLayer(file, map);
};

export {
    readGeoTIFF,
    createImageLayer,
    addGeoTIFFLayer,
    handleFileSelect,
};
