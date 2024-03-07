import React, {useEffect, useState} from 'react';
import "./MapInfo.css";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import {fetchWmsService} from "../utils/fetchParseWMS";
import {handleFileSelect, addGeoTIFFLayer} from '../utils/fetchParseGeoTIFFs';
import {readGeoTIFF} from '../utils/fetchParseGeoTIFFs'
import GeoTIFF from 'ol/source/GeoTIFF.js';

import fetchWmtsCapabilities from "../utils/WMTSHandler";

export const InputForm = ({onHandleAddLayer}) => {
    const [layerType, setLayerType] = useState('XYZ');
    const [layerUrl, setLayerUrl] = useState('');
    const [dataLayers, setDataLayers] = useState(null);


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
                        console.log(data);
                        setDataLayers(data);
                    } catch (error) {
                        console.error('Error fetching data:', error);
                    }

                }
                getWMS();
                break;
            case 'WFS':// suport for WFS TODOS
                //COLLECT WFS INPUT
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
                /* const getWMTS = async () => {

                     try {
                         const data = await fetchWmtsService(layerUrl);
                         // console.log(data);
                         setDataLayers(data);
                         console.log(dataLayers);
                     } catch (error) {
                         console.error('Error fetching data:', error);
                     }

                 }
                 getWMTS();
                 console.log(dataLayers);*/

                break;
            case 'GeoTIFF':
                const handleGeoTIFF = async () => {
                    try {
                        const fileInput = document.getElementById("fileInput");
                        const file = fileInput.files[0];

                        if (!file) {
                            console.error('No GeoTIFF file selected');
                            return;
                        }

                        // Read the GeoTIFF file and set the data layers
                        const tiffData = await readGeoTIFF(file);
                        setDataLayers(tiffData);
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
                        id="fileInput" // Add an ID to the file input
                        className="input-file"
                        accept=".tif, .tiff"
                        value=''
                        onChange={handleFileSelect}
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