import React, {useEffect, useRef, useState} from 'react';
import "./ControlMenu.css";
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import {Attribution, defaults as defaultControls, MousePosition, OverviewMap, ScaleLine, ZoomSlider} from 'ol/control';
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import {TileWMS} from "ol/source";
import {GeoJSON} from "ol/format";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {bbox as bboxStrategy} from 'ol/loadingstrategy';
import {fetchWmsService} from "../utils/fetchParseWMS";
import ResultList from "./ResultList";

function Maps() {
    const [maps, setMaps] = useState({});
    const mapElement = useRef();
    const [layerType, setLayerType] = useState('XYZ');
    const [layerUrl, setLayerUrl] = useState('');
    const [dataLayers, setDataLayers] = useState(null);


    useEffect( () => {
        //initialize a  main Map
        const initMap = async () => {
            const res = await fetchWmsService('https://geoint.nrlssc.org/nrltileserver/wms/layername?REQUEST=GetCapabilities&SERVICE=WMS');
            const marble = res.Capability.Layer.Layer.find(layer => layer.Name === 'bluemarble');
            const initialMap = new Map({

                target: mapElement.current,
                layers: [// core layer
                    new TileLayer({
                        source: new TileWMS({
                            url: 'https://geoint.nrlssc.org/nrltileserver/wms',
                            params: {
                                'LAYERS': marble.Name,
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

        let layerToAdd;

        switch (layerType) {//support XYZ here
            case 'XYZ':
                layerToAdd = new TileLayer({
                    source: new XYZ({
                        url: layerUrl,

                    }),
                });
                break;
            case 'WMS'://add WMS layeres suport, TileWMS , todos ImageWMS?
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
                const baseUrl = new URL(layerUrl).origin + new URL(layerUrl).pathname.split('/').slice(0, 3).join('/');
                console.log(baseUrl);
                layerToAdd = new TileLayer({
                    source: new TileWMS({
                       url:baseUrl ,
                        params: {
                            'LAYERS':"DBDBV7_level0_30sec_nps",
                        },
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
   function onSelectLayerHandler(name){
       const newLayer = new TileLayer({
           source: new TileWMS({
               url: 'https://geoint.nrlssc.org/nrltileserver/wms',
               params: {
                   'LAYERS': name,
               },
               serverType: 'geoserver',
           }),

       })
       maps.addLayer(newLayer);
   console.log(maps.getLayers());
   }

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
            {dataLayers && <ResultList input={dataLayers} onSelectLayer={onSelectLayerHandler}/>}
        </>
    );
}

export default Maps;