import React, {useEffect, useRef, useState} from 'react';
import "./Maps.css";
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import {defaults as defaultControls, MousePosition, OverviewMap, ScaleLine, ZoomSlider} from 'ol/control';
import TileLayer from "ol/layer/Tile";
import {TileWMS, WMTS} from "ol/source";
import {fetchWmsService} from "../utils/fetchParseWMS";
import {MapInfo} from "./MapInfo";



function Maps() {
    const [maps, setMaps] = useState({});
    const mapElement = useRef();
    const [dataLayers, setDataLayers] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [searching, setSearching] = useState(false);
    const [layerType, setLayerType] = useState('XYZ');
    const [layerUrl, setLayerUrl] = useState('');
    const [savedLayers, setSavedLayers] = useState([]); // New state to store saved layers

    const toggleBottomBar = () => {
        setExpanded(!expanded);
    };

    function toggleSearchUrl() {
        setSearching(!searching);
    }

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
    const handleAddLayer = async () => {
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
                case 'WMTS':
                    //adding a wmts layer
            try {
                const wmtsLayer = await createWmtsLayer('https://geoint.nrlssc.org/nrltileserver/wmts');
                if (maps && wmtsLayer) {
                    maps.addLayer(wmtsLayer);
                    console.log("maps: ", maps.getLayers());
                    setLayerUrl('');
                }
            } catch (error) {
                console.error('Error adding WMTS layer:', error);
            }
            break;
                default:
                    console.error('Invalid layer type');
                    return;
            }
            if (maps && layerToAdd) {
                // Save the layer to the state
                setSavedLayers(prevLayers => [...prevLayers, layerToAdd]);
                maps.addLayer(layerToAdd);
                setLayerUrl('');
        }
    };
    // Function to log saved layers to the console
    const showSavedLayers = () => {
        console.log("Saved Layers:", savedLayers);
    };


    return (
        <>
            <div id='map' className="map" ref={mapElement}/>
            <button className="menu-btn" onClick={toggleBottomBar}>{expanded ? "Hide" : "Map"} </button>
            <button className="search-btn" onClick={toggleSearchUrl}>{searching ? "Hide" : "Import"}</button>
            <div className={`bottom-container ${expanded ? 'bottom-expanded' : ''}`}>
                <MapInfo map={maps}/>
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
                <button className="control-btn" onClick={handleAddLayer}>
                    Add Layer
                </button>
    
                {/* Button to show saved layers */}
                <button className="control-btn" onClick={showSavedLayers}>
                    Show Saved Layers
                </button>
            </div>

        </>
    );
    
}

export default Maps;