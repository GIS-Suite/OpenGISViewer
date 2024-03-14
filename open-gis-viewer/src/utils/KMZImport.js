import ImageLayer from 'ol/layer/Image';
import ImageSource from 'ol/source/Image';
import { createCanvasContext2D } from 'ol/dom';
import JSZip from 'jszip'; // Import JSZip for handling KMZ files

const readKMZ = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const arrayBuffer = event.target.result;
                const zip = await JSZip.loadAsync(arrayBuffer); // Load KMZ file with JSZip
                const kml = await zip.file('doc.kml').async('text'); // Read KML file from the KMZ
                resolve(kml);
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

const createImageLayerFromKML = (kml, map) => {
    const features = parseKML(kml); // Parse KML to features
    const vectorSource = new VectorSource({ features });
    const imageLayer = new ImageLayer({ source: vectorSource });
    map.addLayer(imageLayer);
};

const handleKMZFileSelect = async (event, map) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const kml = await readKMZ(file);
        createImageLayerFromKML(kml, map);
    } catch (error) {
        console.error('Error handling KMZ file:', error);
    }
};

export {
    readKMZ,
    createImageLayerFromKML,
    handleKMZFileSelect,
};
