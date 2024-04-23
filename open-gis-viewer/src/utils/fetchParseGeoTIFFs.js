import {fromBlob} from "geotiff";
import WebGLTileLayer from "ol/layer/WebGLTile";
import GeoTIFF from "ol/source/GeoTIFF";

export async function handleFileSelect(file) {


    const tiff = await fromBlob(file);
    const image = await tiff.getImage();
    const data = await image.readRasters();
    const width = image.getWidth();
    const height = image.getHeight();
    const tileWidth = image.getTileWidth();
    const tileHeight = image.getTileHeight();
    const samplesPerPixel = image.getSamplesPerPixel();
    const resolution = image.getResolution();
    const extent = image.getBoundingBox();
    const dataurl = URL.createObjectURL(file);
    console.log("Local file URL:", dataurl, image);

    return new WebGLTileLayer({
        source: new GeoTIFF({
            sources: [{
                url: dataurl,
                //  blob: file,
                min: 0,
                max: 255,

            }],
            transition: 0,
            wrapX: true,
            normalize: true,
            interpolate: true,

        }),

    });
}
