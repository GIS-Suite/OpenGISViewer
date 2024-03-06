import { WMTSCapabilities } from 'ol/format';
import TileGrid from 'ol/tilegrid/TileGrid';
import TileLayer from 'ol/layer/Tile'; // Corrected import for TileLayer
import { TileWMS, WMTS } from 'ol/source';

//Fetching WMS Capabilities from the URL
async function fetchWmtsCapabilities(url) {
    try {
        const response = await fetch(url);
        const text = await response.text();
        const parser = new WMTSCapabilities();
        const capabilities = parser.read(text);
        return capabilities;
        
    } catch (error) {
        console.error('Error fetching or parsing WMTS capabilities:', error);
        return null;
    }
}
//Creating a WMTS layer based on what we fetched and other params
function createWmtsLayer(wmtsCapabilities, layerIdentifier, tileMatrixSet, format, projection) {
    console.log('WMTS Capabilities:', wmtsCapabilities);

    if (!wmtsCapabilities || !wmtsCapabilities.Contents || !Array.isArray(wmtsCapabilities.Contents.TileMatrixSet)) {
        console.error('Invalid WMTS capabilities:', wmtsCapabilities);
        return null;
    }

    const matrixSet = wmtsCapabilities.Contents.TileMatrixSet.find(set => set.Identifier === tileMatrixSet);

    if (!matrixSet) {
        console.error('Invalid TileMatrixSet:', tileMatrixSet);
        return null;
    }

    //Log the matrixset to check its contents
    console.log('Matrix Set:', matrixSet); 
    
    //Extract TileMatrixSet identifiers and resolutions etc
    const matrixIds = matrixSet.TileMatrix.map(tileMatrix => tileMatrix.Identifier);
    const resolutions = matrixSet.TileMatrix.map(tileMatrix => tileMatrix.ScaleDenominator * 0.00028 / 25.4 / 96);

    //Create a tileGrid using that info
    const tileGrid = new TileGrid({
        origin: [matrixSet.TileMatrix[0].TopLeftCorner[0], matrixSet.TileMatrix[0].TopLeftCorner[1]],
        resolutions: resolutions,
        matrixIds: matrixIds,
    });

    //Creating a wmts source using those params
    const wmtsSource = new WMTS({
        url: 'https://geoint.nrlssc.org/nrltileserver/wmts',
        layer: layerIdentifier,
        matrixSet: tileMatrixSet, // Assuming the tileMatrixSet is available
        format: format,
        projection: projection,
        tileGrid: tileGrid,
    });

    //Creating a TileLayer using the WMTS source
    const wmtsLayer = new TileLayer({
        source: wmtsSource,
    });

    return wmtsLayer;
}
//Exporting for use in maps.js
export { fetchWmtsCapabilities, createWmtsLayer };
