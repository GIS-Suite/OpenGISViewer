import React from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import {StadiaMaps} from "ol/source";
import {useGeographic} from "ol/proj";


function Maps() {

    let doMap = () =>{
        useGeographic();

        const layer = new TileLayer({
            source: new StadiaMaps({
                layer: 'stamen_toner',
            }),
        });

        return new Map({
            layers: [layer],
            target: 'map',
            view: new View({
                center: [0, 0],
                zoom: 2,
            })});
    };

    return (
        <div>{() => doMap()}</div>

    );
}

export default Maps;