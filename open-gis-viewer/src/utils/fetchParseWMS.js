
import {WMSCapabilities} from "ol/format";
//parse WMS
export const fetchWmsService = async (url) => {

    const parser = new WMSCapabilities();
    try {
        const response = await fetch(`${url}`);
        const text = await response.text();

        return parser.read(text);
    } catch (error) {
        console.error('Error fetching or parsing WMS:', error);
    }

};
/* const fetchWms = async () => {//fetch bluemarble layer or else from url
      try {
          const response = await fetch('https://geoint.nrlssc.org/nrltileserver/wms?REQUEST=GetCapabilities&SERVICE=WMS&VERSION=1.3.0');
          const text = await response.text();
          const result = parser.read(text);
          return result.Capability.Layer.Layer.find(layer => layer.Name === 'bluemarble');

      } catch (error) {
          console.error('Error fetching or parsing WMS capabilities:', error);
      }
  };*/
