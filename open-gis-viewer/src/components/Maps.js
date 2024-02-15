import React, {useEffect, useRef, useState} from 'react';
import  "./ControlMenu.css";
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import {MousePosition, defaults as defaultControls, ZoomSlider, Attribution} from 'ol/control';
import { ScaleLine } from 'ol/control';
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import {ImageWMS, TileJSON, TileWMS, WMTS} from "ol/source";
import ImageLayer from "ol/layer/Image";
import {GeoJSON, WMTSCapabilities} from "ol/format";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {bbox as bboxStrategy} from 'ol/loadingstrategy.js';
function Maps() {
    const [maps, setMaps] = useState({});
    const mapElement = useRef();

    const [layerType, setLayerType] = useState('XYZ');
    const [layerUrl, setLayerUrl] = useState('');



    useEffect(() => {

        const initialMap = new Map({
            target: mapElement.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                })
            ],
            view: new View({
                center: [0, 0],
                zoom: 2
            }),
            controls: defaultControls().extend([
                new MousePosition({
                    coordinateFormat: (coordinate) => {
                        return `Coordinates: ${coordinate[0].toFixed(2)}, ${coordinate[1].toFixed(2)}`;
                    },
                    projection: 'EPSG:4326',
                    className: 'custom-mouse-position',
                    target: document.getElementById('mouse-position'),
                    undefinedHTML: '&nbsp;'
                }),
                new ScaleLine(),
                new ZoomSlider(),
                new ScaleLine(),


            ]),

        });

setMaps(initialMap);


    }, []);
    const handleAddLayer = () => {
console.log("my map", maps);
        let layerToAdd;

        switch (layerType) {
            case 'XYZ':
                layerToAdd = new TileLayer({
                    source: new XYZ({
                        url: layerUrl,

                    }),

                });
                break;
            case 'WMS':
                layerToAdd = new TileLayer({
                    source: new TileWMS({
                        url: layerUrl,
                        params: {'LAYERS': 'topp:states', 'TILED': true},
                        serverType: 'geoserver',
                        transition: 0,
                    })
                });
                break;
            case 'WFS':
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
            case 'WMTS':
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
            <div className='content' >

                <select value={layerType} onChange={(e) => setLayerType(e.target.value)}>
                    <option value="XYZ">XYZ (Tile) Layer</option>
                    <option value="WFS">WFS  Layer</option>
                    <option value="WMS">WMS  Layer</option>
                    <option value="WMTS">WMTS  Layer</option>
                </select>
                <input
                    type="text"
                    value={layerUrl}
                    onChange={(e) => setLayerUrl(e.target.value)}
                    placeholder="Enter layer URL"
                />
                <button className="control-btn"
                        onClick={handleAddLayer}>Add Layer</button>
            </div>

        </>


    );
}

export default Maps;