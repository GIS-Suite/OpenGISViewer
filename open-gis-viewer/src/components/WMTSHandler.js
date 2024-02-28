import { WMTSCapabilities } from 'ol/format';
import TileGrid from 'ol/tilegrid/TileGrid';
import TileLayer from 'ol/layer/Tile'; // Corrected import for TileLayer
import { TileWMS, WMTS } from 'ol/source';


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

function createWmtsLayer(wmtsCapabilities, layerIdentifier, tileMatrixSet, format, projection) {
    const matrixSet = wmtsCapabilities.Contents.TileMatrixSet.find(set => set.Identifier === tileMatrixSet);

    if (!matrixSet) {
        console.error('Invalid TileMatrixSet:', tileMatrixSet);
        return null;
    }

    console.log('Matrix Set:', matrixSet); // Log matrixSet to check its content

    const matrixIds = matrixSet.TileMatrix.map(tileMatrix => tileMatrix.Identifier);
    const resolutions = matrixSet.TileMatrix.map(tileMatrix => tileMatrix.ScaleDenominator * 0.00028 / 25.4 / 96);

    const tileGrid = new TileGrid({
        origin: [matrixSet.TileMatrix[0].TopLeftCorner[0], matrixSet.TileMatrix[0].TopLeftCorner[1]],
        resolutions: resolutions,
        matrixIds: matrixIds,
    });

    const wmtsSource = new WMTS({
        url: 'https://geoint.nrlssc.org/nrltileserver/wmts',
        layer: layerIdentifier,
        matrixSet: tileMatrixSet, // Assuming the tileMatrixSet is available
        format: format,
        projection: projection,
        tileGrid: tileGrid,
    });

    const wmtsLayer = new TileLayer({
        source: wmtsSource,
    });

    return wmtsLayer;
}

export { fetchWmtsCapabilities, createWmtsLayer };
