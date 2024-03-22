import JSZip from 'jszip';
import { Image as ImageLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Feature } from 'ol';
import { Point } from 'ol/geom';

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
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlContent, 'text/xml');
    
    const placemarks = xmlDoc.querySelectorAll('Placemark');
    const features = [];

    placemarks.forEach(placemark => {
        const name = placemark.querySelector('name').textContent;
        const description = placemark.querySelector('description').textContent;
        const coordinates = placemark.querySelector('Point coordinates').textContent.trim().split(',');
        const [longitude, latitude] = coordinates.map(coord => parseFloat(coord));

        const feature = new Feature({
            geometry: new Point([longitude, latitude]),
            name: name,
            description: description
        });

        features.push(feature);
    });

    return features;
};

const handleKMZFileSelect = async (file, map) => {
    try {
        const kmlContent = await readKMZ(file);
        const features = parseKML(kmlContent);

        const vectorSource = new VectorSource({ features });
        const imageLayer = new ImageLayer({ source: vectorSource });

        map.addLayer(imageLayer);
    } catch (error) {
        console.error('Error handling KMZ file:', error);
    }
};

export { handleKMZFileSelect };
