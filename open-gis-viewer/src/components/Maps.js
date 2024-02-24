import React, {useEffect, useRef, useState} from 'react';
import "./Maps.css";
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import {Attribution, defaults as defaultControls, MousePosition, OverviewMap, ScaleLine, ZoomSlider} from 'ol/control';
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import {TileWMS, WMTS} from "ol/source";
import {GeoJSON} from "ol/format";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {bbox as bboxStrategy} from 'ol/loadingstrategy';
import {fetchWmsService} from "../utils/fetchParseWMS";
import DataList from "./DataList";
import {isNotEmpty, validateWMSUrl, validateXYZUrl} from "../utils/vaidateInputUrl";
import {fetchWmtsService} from "../utils/fetchParseWMTS";
import {getTopLeft, getWidth} from "ol/extent";
import {get} from "ol/proj";
import WMTSTileGrid from "ol/tilegrid/WMTS";

function handleFileSelect(event) {
    const file = event.target.files[0]; // Get the selected file
    // Process the selected file here (e.g., read the file, parse it, etc.)
    console.log("Selected file:", file);
    // You can perform further processing of the selected file based on your requirements
}

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

    useEffect(() => {
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
                maps.addLayer(layerToAdd);
                // console.log("maps: ", maps.getLayers());
                setDataLayers(layerToAdd);
                console.log(dataLayers);
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
                //  const baseUrl = new URL(layerUrl).origin + new URL(layerUrl).pathname.split('/').slice(0, 3).join('/');
                console.log(dataLayers);
                setLayerUrl('');


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
                setLayerUrl('');
                break;
            default:
                console.error('Invalid layer type');
                return;
        }

    };


    function onSelectLayerHandler(name, type) {
        if (type === 'WMS') {
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
            // console.log(maps.getLayers());}

        } else if (type === 'WMTS') {
            const projection = get('EPSG:3857');
            const projectionExtent = projection.getExtent();
            const size = getWidth(projectionExtent) / 256;
            const resolutions = new Array(19);
            const matrixIds = new Array(19);
            for (let z = 0; z < 19; ++z) {
                // generate resolutions and matrixIds arrays for this WMTS
                resolutions[z] = size / Math.pow(2, z);
                matrixIds[z] = z;
            }
            const newLayer = new TileLayer({
                source: new WMTS({
                    url: 'https://geoint.nrlssc.org/nrltileserver/wmts',
                    params: {
                        'layer': name,
                    },
                    format: 'image/png',
                    projection: projection,
                    tileGrid: new WMTSTileGrid({
                        origin: getTopLeft(projectionExtent),
                        resolutions: resolutions,
                        matrixIds: matrixIds,
                    }),
                }),
            })
            maps.addLayer(newLayer);
        }
    }


    return (
        <>
            < div id='map' className="map" ref={mapElement}/>
            <button className="menu-btn" onClick={toggleBottomBar}>{expanded ? "Hide" : "Import"} </button>

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

                    <div>
                        <div>
                            {!isValid && (
                                <div className="control-error">
                                    <p>Please enter a valid URL</p>
                                </div>
                            )}

                            <button className="control-btn" onClick={handleAddLayer}>
                                Import Layer
                            </button>
                        </div>

                        {/* Conditional rendering for input based on layer type */}
                        {layerType === 'GeoTIFF' ? (
                            <input
                                type="file"
                                className="input-file"
                                accept=".tif, .tiff"
                                onChange={handleFileSelect}
                                required
                            />
                        ) : (
                            <input
                                type="text"
                                className="input-urls"
                                value={layerUrl}
                                onChange={(e) => setLayerUrl(e.target.value)}
                                placeholder="Enter layer URL"
                                required
                            />
                        )}
                    </div>
                </div>
                <DataList input={dataLayers} onSelectLayer={onSelectLayerHandler}/>
            </div>

        </>
    );
}

export default Maps;