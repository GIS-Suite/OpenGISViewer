import Maps from "./Maps";
import {useEffect, useState} from "react";
import ControlMenu from "./ControlMenu";
import * as React from 'react';
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import {ImageWMS, TileWMS} from "ol/source";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {GeoJSON} from "ol/format";
import ImageLayer from "ol/layer/Image";

function AppContainer() {
    const [layer, setLayer] = useState({});
    const [newLayer, setNewLayer] = useState(null);
    const  handleLayer =(layerInfo) =>{

       setLayer( layerInfo);


    }

    useEffect(() => {
        console.log(layer);
        const handleAddLayer = () => {
            let layerToAdd;

            switch (layer['layerType']) {
                case 'XYZ':
                    layerToAdd = new TileLayer({
                        source: new XYZ({
                            url: layer['layerUrl'],
                        })
                    });
                    break;
                case 'WMS':
                    layerToAdd = new TileLayer({
                        source: new TileWMS({
                            url: layer['layerUrl'],
                            serverType: 'geoserver'


                        })
                    });
                    break;
                case 'WFS':

                    break;
                default:
                    console.error('Invalid layer type');
                    return;
            }
            setNewLayer(layerToAdd);
            console.log(layer, newLayer);

        };

handleAddLayer();
    }, [layer]);


    return <><Maps layerData={layer} newLayer={newLayer}/><ControlMenu onHandleLayers={handleLayer}/></>


}
export default AppContainer;
