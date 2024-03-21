import { WFS } from "ol/format";
import {
  and as andFilter,
  equalTo as equalToFilter,
  like as likeFilter,
} from "ol/format/filter.js";

export const fetchWfsService = async (url) => {
  const featureRequest = new WFS().writeGetFeature({
    srsName: "EPSG:3857",
    featureNS: "http://openstreempa.org",
    featurePrefix: "osm",
    featureTypes: ["water_areas"],
    outputFormat: "application/json",
    filter: andFilter(
      likeFilter("name", "Mississipi*"),
      equalToFilter("waterway", "riverbank")
    ),
  });

  fetch("https://ahocevar.com/geoserver/wfs", {
    method: "POST",
    body: new XMLSerializer().serializeToString(featureRequest),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      const features = new GeoJSON().readFeatures(json);
      VectorSource.addFeatures(features);
      Map.getView().fit(vectorSource.getExtent());
    });
};
