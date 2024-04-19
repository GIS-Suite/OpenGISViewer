import React, { useEffect, useState } from "react";
import "./MapInfo.css";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fetchWmsService } from "../utils/fetchParseWMS";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { bbox as bboxStrategy } from "ol/loadingstrategy";
import { fetchWmtsService } from "../utils/fetchParseWMTS";
import { fetchWfsService } from "../utils/fetchParseWFS";
import { WFS } from "ol/format";
import {
  and as andFilter,
  equalTo as equalToFilter,
  like as likeFilter,
} from "ol/format/filter.js";

export const InputForm = ({ onHandleAddLayer }) => {
  const [layerType, setLayerType] = useState("XYZ");
  const [layerUrl, setLayerUrl] = useState("");
  const [dataLayers, setDataLayers] = useState(null);
  useEffect(() => {
    console.log("Input_Form Layer:", dataLayers);
    onHandleAddLayer(dataLayers);
  }, [dataLayers]);
  const handleAddLayer = (e, layerType, layerUrl) => {
    e.preventDefault();

    let layerToAdd;
    switch (
      layerType //support XYZ here
    ) {
      case "XYZ":
        layerToAdd = new TileLayer({
          source: new XYZ({
            url: layerUrl,
          }),
        });
        // maps.addLayer(layerToAdd);
        // console.log("maps: ", maps.getLayers());
        setDataLayers(layerToAdd);

        break;
      case "WMS": //add WMS layeres suport, TileWMS
        const getWMS = async () => {
          try {
            const data = await fetchWmsService(layerUrl);
            console.log(data);
            setDataLayers(data);
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        };
        getWMS();
        break;

      case "WFS": // suport for WFS TODOS
        const getWFS = async () => {
          try {
            const featureRequest = new WFS().writeGetFeature({
              srsName: "EPSG:3857",
              featureNS: "https://geoint.nrlssc.org",
              featurePrefix: "osm",
              featureTypes: ["water_areas"],
              outputFormat: "application/json",
              /*filter: andFilter(
                likeFilter("name", "Mississipi*"),
                equalToFilter("waterway", "riverbank")
              ),*/
            });

            console.log(new XMLSerializer().serializeToString(featureRequest));

            const response = fetch(
              "https://geoint.nrlssc.org/embassy-locator/wfs?REQUEST=GetCapabilities&VERSION=1.1.0&SERVICE=WFS",
              {
                method: "POST",
                body: new XMLSerializer().serializeToString(featureRequest),
              }
            );
            if (!response.ok) {
              throw new Error("Network response is not okay");
            }
            const data = await response.data;
            console.log(data);
            /*.then(function (response) {
                console.log(response);
                return response.json();
              })
              .then(function (json) {
                console.log(json);
                const features = new GeoJSON().readFeatures(json);
                VectorSource.addFeatures(features);
                map.getView().fit(vectorSource.getExtent());
              });*/
            //const data = await fetchWfsService(layerUrl);
            //console.log("Entered Url: ", layerUrl);
            //console.log("URL Data: ", data);
            //setDataLayers(data);
          } catch (error) {
            console.error("Error fetching WFS: ", error);
          }
        };
        getWFS();
        break;
      case "WMTS": //support for WMTS
        const getWMTS = async () => {
          try {
            const data = await fetchWmtsService(layerUrl);
            // console.log(data);
            setDataLayers(data);
            console.log(dataLayers);
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        };
        getWMTS();
        console.log(dataLayers);

        break;
      default:
        console.error("Invalid layer type");
        return;
    }
  };
  return (
    <>
      <form
        className="input-form-container"
        onSubmit={(e) => {
          handleAddLayer(e, layerType, layerUrl);
        }}
      >
        <div className="input-label-wrapper">
          <label>
            <input
              type="radio"
              value="XYZ"
              checked={layerType === "XYZ"}
              onChange={() => setLayerType("XYZ")}
            />
            XYZ
          </label>
          <label>
            <input
              type="radio"
              value="WFS"
              checked={layerType === "WFS"}
              onChange={() => setLayerType("WFS")}
            />
            WFS
          </label>
          <label>
            <input
              type="radio"
              value="WMS"
              checked={layerType === "WMS"}
              onChange={() => setLayerType("WMS")}
            />
            WMS
          </label>
          <label>
            <input
              type="radio"
              value="WMTS"
              checked={layerType === "WMTS"}
              onChange={() => setLayerType("WMTS")}
            />
            WMTS
          </label>
        </div>

        <input
          id="url"
          type="url"
          className="input-urls"
          value={layerUrl}
          onChange={(e) => setLayerUrl(e.target.value)}
          placeholder="Enter layer URL"
          required
        />
        <button className="input-btn">Import Layer</button>
      </form>
    </>
  );
};
