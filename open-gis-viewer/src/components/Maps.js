import React, { useEffect, useRef, useState } from 'react';
import "./Maps.css";
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import { defaults as defaultControls, MousePosition, OverviewMap, ScaleLine, ZoomSlider } from 'ol/control';
import TileLayer from "ol/layer/Tile";
import { TileWMS } from "ol/source";
import { fetchWmsService } from "../utils/fetchParseWMS";
import { MapInfo } from "./MapInfo";

function Maps() {
    const [maps, setMaps] = useState({});
    const mapElement = useRef();
    const [expanded, setExpanded] = useState(false);

    const toggleBottomBar = () => {
        setExpanded(!expanded);
    };

    useEffect(() => {
        const initMap = async () => {
            const res = await fetchWmsService('https://geoint.nrlssc.org/nrltileserver/wms/layername?REQUEST=GetCapabilities&SERVICE=WMS');
            const marble = res.Capability.Layer.Layer.find(layer => layer.Name === 'bluemarble');
            const initialMap = new Map({
                target: mapElement.current,
                layers: [
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
                controls: defaultControls().extend([
                    new MousePosition({
                        coordinateFormat: (coordinate) => {
                            return `Coordinates: ${coordinate[0].toFixed(2)}, ${coordinate[1].toFixed(2)}`;
                        },
                        projection: 'EPSG:4326',
                        className: 'cursor-map-controls',
                        undefinedHTML: '&nbsp;'
                    }),
                    new ScaleLine({ units: 'us' }),
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

    const handleButtonClick = async () => {
        const baseLayer = maps.getLayers().item(0); // Get the base layer
        const layers = Array.from(maps.getLayers().getArray()); // Get all layers from the map
        maps.getLayers().clear(); // Clear the map layers
        const res = await fetchWmsService('https://geoint.nrlssc.org/nrltileserver/wms/layername?REQUEST=GetCapabilities&SERVICE=WMS');
        const marble = res.Capability.Layer.Layer.find(layer => layer.Name === 'bluemarble');
        const initialLayers = [
            new TileLayer({
                source: new TileWMS({
                    url: 'https://geoint.nrlssc.org/nrltileserver/wms',
                    params: {
                        'LAYERS': marble.Name,
                    },
                    serverType: 'geoserver',
                }),
            })
            // Add more layers as needed
        ];
        initialLayers.forEach(layer => {
            maps.addLayer(layer); // Add the initial layers back to the map
        });
        layers.forEach(layer => {
            if (layer !== baseLayer) {
                maps.addLayer(layer); // Add the previously selected layers back to the map
            }
        });
    };
    

    return (
        <>
            <div id='map' className="map" ref={mapElement} />
            <button className="menu-btn" onClick={toggleBottomBar}>{expanded ? "Hide" : "Map"} </button>
            <button className="redraw-btn" onClick={handleButtonClick}>Refresh</button>
            <div className={`bottom-container ${expanded ? 'bottom-expanded' : ''}`}>
                <MapInfo map={maps} onToogleBottomMenu={toggleBottomBar} />
            </div>
        </>
    );
}

export default Maps;
