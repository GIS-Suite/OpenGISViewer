import {WMTSCapabilities} from "ol/format";


export const fetchWmtsService = async (url) => {

    const parser = new WMTSCapabilities();
    try {
        const response = await fetch(`${url}`);
        const text = await response.text();

        return parser.read(text);
    } catch (error) {
        console.error('Error fetching or parsing WMTS:', error);
    }

};