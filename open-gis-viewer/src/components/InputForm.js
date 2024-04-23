import React, {useEffect, useState} from "react";
import "./MapInfo.css";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
/*import {addGeoTIFFLayer, handleFileSelect, readGeoTIFF} from "../utils/fetchParseGeoTIFFs";*/
import fetchWmtsCapabilities from "../utils/WMTSHandler";
import {handleFileSelect} from "../utils/fetchParseGeoTIFFs";
import {fetchWmsService} from "../utils/fetchParseWMS";


export const InputForm = ({onHandleAddLayer, onHandleTiff}) => {
    const [layerType, setLayerType] = useState('XYZ');
    const [layerUrl, setLayerUrl] = useState('');
    const [dataLayers, setDataLayers] = useState(null);
    const handleGeotiffCreation = (e) => {

        handleFileSelect(e.target.files[0])
            .then(layer => {
                console.log("TIFF DATA:", layer);
                onHandleTiff(layer);
            })
            .catch(error => {
                console.error('Error:', error);
            });


    }
    useEffect(() => {
        console.log("Input_Form Layer:", dataLayers);
        onHandleAddLayer(dataLayers);
    }, [dataLayers]);
    //Only get input from user , send req to api get data ,here and pass data objct for further manipulations elswhere
    const handleAddLayer = (e, layerType, layerUrl) => {
        e.preventDefault();

        let layerToAdd;
        switch (layerType) {//support XYZ here
            case 'XYZ':
                layerToAdd = new TileLayer({
                    source: new XYZ({
                        url: layerUrl,
                    }),
                });
                setDataLayers(layerToAdd);
                break;
            case 'WMS'://add WMS layeres suport, TileWMS
                const getWMS = async () => {

                    try {
                        const data = await fetchWmsService(layerUrl);
                        setDataLayers(data);
                    } catch (error) {
                        console.error('Error fetching data:', error);
                    }

                }
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

            case 'WMTS'://support for WMTS

                const getWMTS = async () => {
                    try {

                        const wmtsLayer = await fetchWmtsCapabilities(layerUrl);
                        setDataLayers(wmtsLayer);
                    } catch (error) {
                        console.error('Error adding WMTS layer:', error);
                    }
                }
                getWMTS();
                break;
            case 'GeoTIFF': // Handle GeoTIFF files
                const handleGeoTIFF = async () => {
                    try {
                        //read file
                        const tiffData = await readGeoTIFF(layerUrl);
                        //add layer
                        const geoTIFFLayer = await addGeoTIFFLayer(tiffData);
                        //  map.addLayer(geoTIFFLayer);
                        setDataLayers(geoTIFFLayer); //Collect just input from user in this file
                    } catch (error) {
                        console.error('Error handling GeoTIFF:', error);
                    }
                };
                handleGeoTIFF();
                break;
            default:
                console.error('Invalid layer type');
                return;
        }

    };
    return (
        < >
            <form className='input-form-container' onSubmit={
                (e) => {
                    handleAddLayer(e, layerType, layerUrl)
                }
            }>
                <div className="input-label-wrapper">
                    <label>
                        <input
                            type="radio"
                            value="XYZ"
                            checked={layerType === 'XYZ'}
                            onChange={() => setLayerType('XYZ')}
                        />
                        XYZ
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="WFS"
                            checked={layerType === 'WFS'}
                            onChange={() => setLayerType('WFS')}
                        />
                        WFS
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="WMS"
                            checked={layerType === 'WMS'}
                            onChange={() => setLayerType('WMS')}
                        />
                        WMS
                    </label>
                    <label>

                        <input
                            type="radio"
                            value="WMTS"
                            checked={layerType === 'WMTS'}
                            onChange={() => setLayerType('WMTS')}
                        />
                        WMTS
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="GeoTIFF"
                            checked={layerType === 'GeoTIFF'}
                            onChange={() => setLayerType('GeoTIFF')}
                        />
                        GeoTIFF
                    </label>
                </div>
                {layerType === 'GeoTIFF' ? (
                    <input
                        type="file"
                        className="input-file"
                        accept=".tif, .tiff"
                        value=''
                        onChange={handleGeotiffCreation}
                        required
                    />) : (<><input
                    id="url"
                    type="url"
                    className="input-urls"
                    onChange={(e) => setLayerUrl(e.target.value)}
                    placeholder="Enter layer URL"
                    required
                />
                    <button className="input-btn">Import Layer
                    </button>
                </>)}
            </form>
        </>)


}

