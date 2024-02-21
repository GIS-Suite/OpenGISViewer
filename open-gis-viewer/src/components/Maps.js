import React, {useEffect, useRef, useState} from 'react';
import "./Maps.css";
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
import DataList from "./DataList";
import {isNotEmpty, validateWMSUrl, validateXYZUrl} from "../utils/vaidateInputUrl";
import {fetchWmtsService} from "../utils/fetchParseWMTS";

function Maps() {
    const [maps, setMaps] = useState({});
    const mapElement = useRef();
    const [layerType, setLayerType] = useState('XYZ');
    const [layerUrl, setLayerUrl] = useState('');
    const [dataLayers, setDataLayers] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [isValid, setIsValid] = useState(true);

    const toggleBottomBar = () => {
        setExpanded(!expanded);

    };

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
                        className: 'cursor-map-controls',// css for map cursor Maps.css
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
        const check = (isNotEmpty(layerUrl) || validateXYZUrl(layerUrl) || validateWMSUrl(layerUrl));
        setIsValid(check);
        let layerToAdd;
        if(!check){
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
                maps.addLayer(layerToAdd);
                console.log("maps: ", maps.getLayers());
                setLayerUrl('');
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
                setLayerUrl('');


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
                const getWMTS = async () => {

                    try {
                        const data = await fetchWmtsService(layerUrl);
                        console.log(data);
                        setDataLayers(data);
                    } catch (error) {
                        console.error('Error fetching data:', error);
                    }

                }
                getWMTS();

                break;
            default:
                console.error('Invalid layer type');
                return;
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
            < div id='map' className="map" ref={mapElement}/>
                <button className="menu-btn" onClick={toggleBottomBar}>{expanded? "Hide" : "Import"} </button>

            <div className={`bottom-container ${expanded ? 'bottom-expanded' : ''}`}>

                <div className='content'>
                    <div className='radios-container'>
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
                    {!isValid && <div className="control-error">
                        <p>Please enter a valid url</p>
                    </div>}
                    <input
                        type="text"
                        className="input-urls"
                        value={layerUrl}
                        onChange={(e) => setLayerUrl(e.target.value)}
                        placeholder="Enter layer URL"
                        required
                    />
                    <button className="control-btn"
                            onClick={handleAddLayer}>Import Layer
                    </button>

                </div>
                <DataList input={dataLayers} onSelectLayer={onSelectLayerHandler}/>
            </div>

        </>
    );
}

export default Maps;