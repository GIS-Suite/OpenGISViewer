import React, {useEffect, useRef, useState} from 'react';
import "./Maps.css";
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import {defaults as defaultControls, MousePosition, OverviewMap, ScaleLine, ZoomSlider} from 'ol/control';
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
import {MapInfo} from "./MapInfo";
import GeoTIFF from 'ol/source/GeoTIFF';
import {addGeoTIFFLayer, readGeoTIFF} from '../utils/fetchParseGeoTIFFs';
import ImageLayer from 'ol/layer/Image';
import ImageCanvasSource from 'ol/source/ImageCanvas';


function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            console.log(event.target.result);
            const arrayBuffer = event.target.result;
            const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
            //fromArrayBuffer is "unresolved" even though its in geotiff and geotiff is imported

            const image = await tiff.getImage();

            const data = await image.readRasters();

            const layer = new ImageLayer({
                source: new ImageCanvasSource({
                    canvasFunction: function (extent, resolution, pixelRatio, size, projection) {
                        const canvas = document.createElement('canvas');
                        canvas.width = size[0];
                        canvas.height = size[1];
                        const ctx = canvas.getContext('2d');

                        //draw raster
                        data.forEach((row, y) => {
                            row.forEach((value, x) => {
                                //pixel value to color
                                const color = `rgba(${value}, ${value}, ${value}, 1)`;
                                ctx.fillStyle = color;
                                ctx.fillRect(x, y, 1, 1);
                            });
                        });

                        return canvas;
                    },
                }),
            });

            map.addLayer(layer);

        } catch (error) {
            console.error('Error reading or processing file:', error);
        }
    };
    reader.onerror = (error) => {
        console.error('Error reading file:', error);
    };
    reader.readAsArrayBuffer(file);
}


function Maps() {
    const [maps, setMaps] = useState({});
    const mapElement = useRef();
    const [dataLayers, setDataLayers] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [searching, setSearching] = useState(false);


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

    return (
        <>
            < div id='map' className="map" ref={mapElement}/>
            <button className="menu-btn" onClick={toggleBottomBar}>{expanded ? "Hide" : "Map"} </button>
            <button className="search-btn" onClick={toggleSearchUrl}>{searching ? "Hide" : "Import"}</button>


            <div className={`bottom-container ${expanded ? 'bottom-expanded' : ''}`}>

                <MapInfo map={maps}/>

            </div>

        </>
    );
}

export default Maps;