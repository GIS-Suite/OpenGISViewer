import React, {useEffect, useState} from 'react';
import "./MapInfo.css";
import {isNotEmpty} from "../utils/vaidateInputUrl";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import {fetchWmsService} from "../utils/fetchParseWMS";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {GeoJSON} from "ol/format";
import {bbox as bboxStrategy} from "ol/loadingstrategy";
import {fetchWmtsService} from "../utils/fetchParseWMTS";

export const InputForm = ({onHandleAddLayer}) => {
    const [layerType, setLayerType] = useState('XYZ');
    const [layerUrl, setLayerUrl] = useState('');
    const [dataLayers, setDataLayers] = useState(null);
    useEffect(() => {
        console.log("Input_form Layer", dataLayers);
        onHandleAddLayer(dataLayers);
    }, [dataLayers]);
    const handleAddLayer = (e, layerType, layerUrl) => {
        e.preventDefault();
        const check = (isNotEmpty(layerUrl));

        let layerToAdd;
        if (!check) {
            console.log("Invalid data");
            return;
        }
        switch (layerType) {//support XYZ here
            case 'XYZ':
                layerToAdd = new TileLayer({
                    source: new XYZ({
                        url: layerUrl,

                    }),
                });
                // maps.addLayer(layerToAdd);
                // console.log("maps: ", maps.getLayers());
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
                layerToAdd = new VectorLayer({
                    source: new VectorSource({
                        format: new GeoJSON(),
                        url: function (extent) {
                            return (layerUrl +
                                'version=1.1.0&request=GetFeature&typename=osm:water_areas&' +
                                'outputFormat=application/json&srsname=EPSG:3857&' +
                                'bbox=' +
                                extent.join(',') +
                                ',EPSG:3857'
                            );
                        },
                        strategy: bboxStrategy,
                    })
                });
                break;
            case 'WMTS'://support for WMTS
                const getWMTS = async () => {

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
                console.log(dataLayers);

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
                <button className="input-btn">Import Layer
                </button>
            </form>
        </>)


}