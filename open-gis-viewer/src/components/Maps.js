import React, {useEffect, useRef, useState} from 'react';
import  "./ControlMenu.css";
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import {MousePosition, defaults as defaultControls, ZoomSlider, Attribution, OverviewMap} from 'ol/control';
import { ScaleLine } from 'ol/control';
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import {ImageWMS, TileJSON, TileWMS, WMTS} from "ol/source";
import {GeoJSON, WMSCapabilities, WMTSCapabilities} from "ol/format";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {bbox as bboxStrategy} from 'ol/loadingstrategy';
function Maps() {
    const [maps, setMaps] = useState({});
    const mapElement = useRef();
    const [layerType, setLayerType] = useState('XYZ');
    const [layerUrl, setLayerUrl] = useState('');

    //parser for WMS xml
    const parser = new WMSCapabilities();
    const fetchWms = async () => {//fetch bluemarble layer or else from url
        try {
            const response = await fetch('https://geoint.nrlssc.org/nrltileserver/wms?REQUEST=GetCapabilities&SERVICE=WMS&VERSION=1.3.0');
            const text = await response.text();
            const result = parser.read(text);
            const marble = result.Capability.Layer.Layer.find(layer => layer.Name === 'bluemarble');
            return marble;

        } catch (error) {
            console.error('Error fetching or parsing WMS capabilities:', error);
        }
    };

    useEffect( () => {
        //initialize a  main Map
        const initMap = async () => {
            let res = await fetchWms();
            console.log("marble;", res);
            const initialMap = new Map({

                target: mapElement.current,
                layers: [// core layer
                    new TileLayer({
                        source: new TileWMS({
                            url: 'https://geoint.nrlssc.org/nrltileserver/wms',
                            params: {
                                'LAYERS': res.Name,
                            },
                            serverType: 'geoserver',
                        }),
                    }),
                ],
                view: new View({
                    center: [0, 0],
                    zoom: 2,
                }),
                //extra controls for the map
                controls: defaultControls().extend([
                    new MousePosition({
                        coordinateFormat: (coordinate) => {
                            return `Coordinates: ${coordinate[0].toFixed(2)}, ${coordinate[1].toFixed(2)}`;
                        },
                        projection: 'EPSG:4326',
                        className: 'cursor-map-controls',
                        //  target: document.getElementById('mouse-position'),

                        undefinedHTML: '&nbsp;'
                    }),
                    new ScaleLine({units: 'us'}),
                    new ZoomSlider(),
                    new OverviewMap({
                        layers: [

                            new TileLayer({
                                source: new OSM(),
                            })
                        ],
                        rotateWithView: true,
                    }),
                ]),
            });
            setMaps(initialMap);
        }
        initMap();
    }, []);
    //handle adding layers based on user input
    const handleAddLayer = () => {
        console.log("Main map", maps);
        let layerToAdd;

        switch (layerType) {//support XYZ here
            case 'XYZ':
                layerToAdd = new TileLayer({
                    source: new XYZ({
                        url: layerUrl,

                    }),
                });
                break;
            case 'WMS'://add WMS layeres suport, TileWMS , todos ImageWMS
                layerToAdd = new TileLayer({
                    source: new TileWMS({
                        url: layerUrl,
                        serverType: 'geoserver',
                    })
                });
                break;
            case 'WFS':// suport for WFS TODOS
                layerToAdd = new VectorLayer({
                    source: new VectorSource({
                        format: new GeoJSON(),
                        url: function(extent) {
                            return ( layerUrl +
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
                const attribution = new Attribution({
                    collapsible: false,
                });
                const parser = new WMTSCapabilities();


                break;
            default:
                console.error('Invalid layer type');
                return;
        }
        if (maps) {
            //add layers to main map
            maps.addLayer(layerToAdd);
            console.log("maps: ", maps.getLayers());
            setLayerUrl('');
        }
    };

    return (
        <>
            <div id='map' className="map"
                 ref={mapElement}/>
            <div id="mouse-position" className="mouse-position"/>
            <div className='content'>

                <select value={layerType} onChange={(e) => setLayerType(e.target.value)}>
                    <option value="XYZ">XYZ (Tile) Layer</option>
                    <option value="WFS">WFS Layer</option>
                    <option value="WMS">WMS Layer</option>
                    <option value="WMTS">WMTS Layer</option>
                </select>
                <input
                    type="text"
                    value={layerUrl}
                    onChange={(e) => setLayerUrl(e.target.value)}
                    placeholder="Enter layer URL"
                />
                <button className="control-btn"
                        onClick={handleAddLayer}>Add Layer
                </button>
            </div>
        </>
    );
}

export default Maps;