import React, {useEffect, useState} from 'react';
import {Section} from "./Section";
import {NavItems} from "./NavItems";
import {NavItemButton} from "./NavItemButton";
import "./MapInfo.css";

import {InputForm} from "./InputForm";
import TileLayer from "ol/layer/Tile";
import {TileWMS, WMTS} from "ol/source";
import {get} from "ol/proj";
import {getTopLeft, getWidth} from "ol/extent";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import DataList from "./DataList";

export const MapInfo = ({map}) => {
    const [selectedTab, setSelectedTab] = useState();
    const [dataLayer, setDataLayer] = useState(null);

    function selectedLayerHandler(dataLayer) {

        setDataLayer(dataLayer);
    }


    console.log("INFO:", dataLayer);
    console.log("INFOMAP:", map);

    function onSelectLayerHandler(name, type, url) {
        const baseUrl = new URL(url).origin + new URL(url).pathname.split('/').slice(0, 3).join('/');
        if (type === 'WMS') {
            const newLayer = new TileLayer({
                source: new TileWMS({

                    // url: 'https://geoint.nrlssc.org/nrltileserver/wms',
                    url: baseUrl,
                    params: {
                        'LAYERS': name,
                    },
                    serverType: 'geoserver',
                }),

            })
            map?.addLayer(newLayer);
            // console.log(maps.getLayers());}

        }

        if (type === 'WMTS') {
            console.log(url);
            const projection = get('EPSG:3857');
            const projectionExtent = projection.getExtent();
            const size = getWidth(projectionExtent) / 256;
            const resolutions = new Array(19);
            const matrixIds = new Array(19);
            for (let z = 0; z < 19; ++z) {
                // generate resolutions and matrixIds arrays for this WMTS
                resolutions[z] = size / Math.pow(2, z);
                matrixIds[z] = z;
            }
            const newLayer = new TileLayer({
                source: new WMTS({
                    url: url,
                    params: {
                        'layer': name,
                    },
                    format: 'image/png',
                    projection: projection,
                    tileGrid: new WMTSTileGrid({
                        origin: getTopLeft(projectionExtent),
                        resolutions: resolutions,
                        matrixIds: matrixIds,
                    }),
                }),
            })
            map?.addLayer(newLayer);
        }
        if (type === 'XYZ') {
            map?.AddLayer(dataLayer);
        }
    }


    function handleSelect(selectedButton) {

        setSelectedTab(selectedButton);

    }

    let infoContent = <p>No data available</p>;

    if (selectedTab === "Import") {
        console.log(selectedTab);
        infoContent = (
            <div className="info-content">
                <InputForm onHandleAddLayer={selectedLayerHandler}/>
                <DataList input={dataLayer} onSelectLayer={onSelectLayerHandler}/>
            </div>
        );
    }

    return (
        <Section className="mapinfo-section">
            <NavItems
                buttons={
                    <>
                        <NavItemButton
                            isSelected={selectedTab === 'Import'}
                            onClick={() => handleSelect('Import')}
                        >
                            Import
                        </NavItemButton>
                        <NavItemButton
                            isSelected={selectedTab === 'Export'}
                            onClick={() => handleSelect('Export')}
                        >
                            Export
                        </NavItemButton>
                        <NavItemButton
                            isSelected={selectedTab === 'Layers'}
                            onClick={() => handleSelect('Layers')}
                        >
                            Layers
                        </NavItemButton>
                        <NavItemButton
                            isSelected={selectedTab === 'Overlays'}
                            onClick={() => handleSelect('Overlays')}
                        >
                            Overlays
                        </NavItemButton>
                        <NavItemButton
                            isSelected={selectedTab === 'Interactions'}
                            onClick={() => handleSelect('Interactions')}
                        >
                            Interactions
                        </NavItemButton>
                    </>
                }
            >
                {infoContent}
            </NavItems>
        </Section>
    );
}