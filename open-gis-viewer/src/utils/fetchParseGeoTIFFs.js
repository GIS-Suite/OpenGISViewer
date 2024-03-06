import GeoTIFF from 'geotiff';
import ImageLayer from 'ol/layer/Image';
import ImageCanvasSource from 'ol/source/ImageCanvas';

export const readGeoTIFF = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const arrayBuffer = event.target.result;
                const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
                //fromArrayBuffer is "unresolved" even though its in geotiff and geotiff is imported
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

export const addGeoTIFFLayer = async (map, file) => {
    try {
        const tiff = await readGeoTIFF(file);
        const image = await tiff.getImage();
        const data = await image.readRasters();

        const imageLayer = new ImageLayer({
            source: new ImageCanvasSource({
                canvasFunction: function (extent, resolution, pixelRatio, size, projection) {
                    const canvas = document.createElement('canvas');
                    canvas.width = size[0];
                    canvas.height = size[1];
                    const context = canvas.getContext('2d');

                    const imageData = context.createImageData(size[0], size[1]);
                    imageData.data.set(data.flat());
                    context.putImageData(imageData, 0, 0);

                    return canvas;
                },
                projection: 'EPSG:3857', // change projection if necessary
                imageExtent: map.getView().calculateExtent(map.getSize()), // adjust extent if necessary
            }),
        });

        map.addLayer(imageLayer);
    } catch (error) {
        console.error('Error adding GeoTIFF layer:', error);
    }
};

export function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            console.log(event.target.result);
            const arrayBuffer = event.target.result;
            const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
            //fromArrayBuffer is "unresolved" even though its in geotiff and geotiff is imported

            const image = await tiff.getImage();

            const data = await image.readRasters();

            const layer = new ImageLayer({
                source: new ImageCanvasSource({
                    canvasFunction: function (extent, resolution, pixelRatio, size, projection) {
                        const canvas = document.createElement('canvas');
                        canvas.width = size[0];
                        canvas.height = size[1];
                        const ctx = canvas.getContext('2d');

                        //draw raster
                        data.forEach((row, y) => {
                            row.forEach((value, x) => {
                                //pixel value to color
                                const color = `rgba(${value}, ${value}, ${value}, 1)`;
                                ctx.fillStyle = color;
                                ctx.fillRect(x, y, 1, 1);
                            });
                        });

                        return canvas;
                    },
                }),
            });

            map.addLayer(layer);

        } catch (error) {
            console.error('Error reading or processing file:', error);
        }
    };
    reader.onerror = (error) => {
        console.error('Error reading file:', error);
    };
    reader.readAsArrayBuffer(file);
}
