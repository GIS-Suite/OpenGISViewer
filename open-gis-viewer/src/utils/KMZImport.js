import JSZip from 'jszip';
import { Image as ImageLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';

const readKMZ = async (file) => {
    try {
        const zip = await JSZip.loadAsync(file);
        const kmlContent = await zip.file('doc.kml').async('text');
        return kmlContent;
    } catch (error) {
        throw new Error('Error reading KMZ file: ' + error.message);
    }
};

const parseKML = (kmlContent) => {
// Testing, just assume it returns an empty array for now
    return [];
};

const handleKMZFileSelect = async (file, map) => {
    try {
        const kml = await readKMZ(file);
        const features = parseKML(kml);
        
        const vectorSource = new VectorSource({ features });
        const imageLayer = new ImageLayer({ source: vectorSource });
        
        map.addLayer(imageLayer);
    } catch (error) {
        console.error('Error handling KMZ file:', error);
    }
};

export {handleKMZFileSelect};
