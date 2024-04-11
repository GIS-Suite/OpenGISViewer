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

function Maps() {
    const [map, setMap] = useState(null);
    const mapElement = useRef();
    const [expanded, setExpanded] = useState(false);
    const toggleBottomBar = () => {
        setExpanded(!expanded);
    };

    useEffect(() => {
        const initMap = async () => {
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

            // Add WMS layer to the map
            const wmsSource = new TileWMS({
                url: 'https://geoint.nrlssc.org/nrltileserver/wms/layername',
                params: {'LAYERS': 'layername', 'TILED': true},
                serverType: 'geoserver',
                crossOrigin: 'anonymous',
            });
            const wmsLayer = new TileLayer({
                source: wmsSource,
            });
            initialMap.addLayer(wmsLayer);

            // Set the map object to state
            setMap(initialMap);
        }
        initMap();
    }, []);

    // Event listener for click on the map
    const handleMapClick = (evt) => {
        if (!map) return;
        
        // Get feature info URL
        const viewResolution = map.getView().getResolution();
        const url = map.getLayers().getArray()[1].getSource().getFeatureInfoUrl(
            evt.coordinate,
            viewResolution,
            map.getView().getProjection(),
            {'INFO_FORMAT': 'text/html'},
        );
        
        console.log('Feature info URL:', url); // Log the feature info URL

        // Fetch feature info
        if (url) {
            fetch(url)
                .then((response) => response.text())
                .then((html) => {
                    console.log('Feature info HTML:', html); // Log the feature info HTML
                    // Update UI with feature info
                    // For example, you can set it in the state and display it in MapInfo component
                })
                .catch((error) => {
                    console.error('Error fetching feature info:', error);
                });
        }
    };

    return (
        <>
            <div id='map' className="map" ref={mapElement} onClick={handleMapClick}/>
            <button className="menu-btn" onClick={toggleBottomBar}>{expanded ? "Hide" : "Map"} </button>
            <div className={`bottom-container ${expanded ? 'bottom-expanded' : ''}`}>
                <MapInfo map={map} onToogleBottomMenu={toggleBottomBar}/>
            </div>
        </>
    );
}

export default Maps;
