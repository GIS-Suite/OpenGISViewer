import React, {useEffect, useRef, useState} from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

function Maps() {
    const [maps, setMaps] = useState();
    const mapElement = useRef();

//to do ....
    useEffect(() => {

        const initialMap = new Map({
            target: mapElement.current,
            layers: [
                new TileLayer({
                    source: new OSM()
                })
            ],
            view: new View({
                center: [0, 0],
                zoom: 2
            }),

        });
        setMaps(initialMap);
    }, []);

    return (
        <div>
            <div id='map' style={{width: '100%', height: '800px'}}
                 ref={mapElement}/>

        </div>


    );
}

export default Maps;