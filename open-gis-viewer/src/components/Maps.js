import React, {useEffect, useRef, useState} from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import { MousePosition, defaults as defaultControls } from 'ol/control';
import { ScaleLine } from 'ol/control';
import {TileWMS} from "ol/source";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

function Maps({layerData, newLayer}) {
    const [maps, setMaps] = useState();
    const mapElement = useRef();
     console.log( newLayer);

    useEffect(() => {

        const initialMap = new Map({
            target: mapElement.current,
            layers: [
                new TileLayer({
                    source: new XYZ({
                        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    })
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
                new ScaleLine()
            ]),

        });
        if (newLayer) {
            initialMap.addLayer(newLayer);
        }


        return () => {
            initialMap.setTarget(null);
        };
    }, [newLayer]);

    return (
        <>
            <div id='map' className="map"
                 ref={mapElement}/>
            <div id="mouse-position" className="mouse-position"/>

        </>


    );
}

export default Maps;