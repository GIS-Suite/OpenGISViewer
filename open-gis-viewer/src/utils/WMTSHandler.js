import {WMTSCapabilities} from 'ol/format';

export default async function fetchWmtsCapabilities(url) {

    try {
        const response = await fetch(url);
        const text = await response.text();
        const parser = new WMTSCapabilities();
        return parser.read(text);
    } catch (error) {
        console.error('Error fetching or parsing WMTS capabilities:', error);
        return null;
    }
}


