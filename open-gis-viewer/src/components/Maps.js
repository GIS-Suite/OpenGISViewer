import React, { useEffect, useRef, useState } from 'react';
import './Maps.css';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import { defaults as defaultControls, MousePosition, OverviewMap, ScaleLine, ZoomSlider } from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import { TileWMS } from 'ol/source';
import { MapInfo } from './MapInfo';
import WMSGetFeatureInfo from 'ol/format/WMSGetFeatureInfo.js'; // Import WMSGetFeatureInfo

// Define the fetchWmsService function
const fetchWmsService = async (url) => {
    try {
        const response = await fetch(url);
        const data = await response.text(); // Get response as text
        return data;
    } catch (error) {
        console.error('Error fetching WMS service:', error);
        throw error; // Rethrow the error to handle it elsewhere if needed
    }
};

function Maps() {
    const [maps, setMaps] = useState({});
    const mapElement = useRef();
    const [expanded, setExpanded] = useState(false);
    const toggleBottomBar = () => {
        setExpanded(!expanded);
    };

    useEffect(() => {
        const initMap = async () => {
            const xmlText = await fetchWmsService('https://geoint.nrlssc.org/nrltileserver/wms/layername?REQUEST=GetCapabilities&SERVICE=WMS');
            // Handle XML response here
            console.log(xmlText); // Log the XML response for debugging

            // Initialize map with default layers and controls
            const initialMap = new Map({
                target: mapElement.current,
                layers: [
                    new TileLayer({
                        source: new OSM(),
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

    return (
        <>
            <div id='map' className="map" ref={mapElement}/>
            <button className="menu-btn" onClick={toggleBottomBar}>{expanded ? "Hide" : "Map"} </button>
            <div className={`bottom-container ${expanded ? 'bottom-expanded' : ''}`}>
                <MapInfo map={maps} onToogleBottomMenu={toggleBottomBar}/>
            </div>
        </>
    );
}

export default Maps;
