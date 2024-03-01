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
            <div id='map' className="map" ref={mapElement}/>
            <button className="menu-btn" onClick={toggleBottomBar}>{expanded ? "Hide" : "Map"} </button>
            {/*<button className="search-btn" onClick={toggleSearchUrl}>{searching ? "Hide" : "Import"}</button>*/}
            <div className={`bottom-container ${expanded ? 'bottom-expanded' : ''}`}>
                <MapInfo map={maps} onToogleBottomMenu={toggleBottomBar}/>
            </div>

        </>
    );
}

export default Maps;