import React, {useEffect, useState} from 'react';
import {Section} from "../UI/Section";
import {SectionItem} from "../UI/SectionItem";
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
    const [selectedTab, setSelectedTab] = useState('Import');
    const [dataLayer, setDataLayer] = useState(null);
    const [showData, setShowData] = useState(false);
    const [opacity, setOpacity] = useState('');
    const [zIndex, setZIndex] = useState(0);
    const [visibleLayer, setVisibleLayer] = useState(true);

    const data = {};

    function selectedLayerHandler(data) {
        if (data) {
            setShowData(true);
        }

        setDataLayer(data);
    }

    console.log(map);
    console.log("INFO:", data);
    useEffect(() => {
        console.log("INFOMAP:", map);

    }, [map, dataLayer])


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
            map.addLayer(newLayer);
            // console.log(map.getLayers());

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
            map.addLayer(dataLayer);
            console.log(map.getLayer());
        }
    }


    function handleSelect(selectedButton) {

        setSelectedTab(selectedButton);

    }

    let infoContent = <p className="mapinfo-section-no-data">No data available</p>;


    if (selectedTab === "Import") {
        infoContent = (
            <div className="mapinfo-content">
                {!showData && <InputForm onHandleAddLayer={selectedLayerHandler}/>}
                {showData &&
                    <DataList input={dataLayer} onSelectLayer={onSelectLayerHandler}/>

                }

            </div>
        );
    } else if (selectedTab === "Layers") {
        console.log("L", map.getLayers().getArray());
        const layer = map.getLayers().getArray();

        function handleVisibilityChange(layer, checked) {
            setVisibleLayer(checked);
            layer.setVisible(checked);
        }

        function handleOpacityChange(layer, number, index) {
            console.log("Layer:", layer);
            setOpacity(number);
            layer.setOpacity(number);

        }

        function handleZIndexChange(layer, number) {
            setZIndex(number);
            layer.setZIndex(number);
        }

        function removeLayerHandler(layer, index) {
            console.log("Remove", layer.getSource());

            map.removeLayer(layer);

        }

        infoContent = (


            <>
                <table className="map-table">
                    <thead>
                    <tr>
                        <th>Layer Name</th>
                        <th>Visible</th>
                        <th>Opacity</th>
                        <th>ZIndex</th>
                        <th>Delete</th>
                    </tr>
                    </thead>

                    <tbody>
                    {layer.map((layer, index) => (
                        <tr key={index} className="map-row">
                            <td> {index + 1}{layer.values_.source.params_.LAYERS}</td>
                            <td><input
                                type="checkbox"
                                checked={visibleLayer}
                                onChange={(e) => handleVisibilityChange(layer, e.target.checked)}
                            /></td>
                            <td><input
                                id="opacity"
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={opacity}
                                onChange={(e) => handleOpacityChange(layer, parseFloat(e.target.value), index)}
                            /></td>
                            <td><input
                                type="number"
                                min="0"
                                value={zIndex}
                                onChange={(e) => handleZIndexChange(layer, parseInt(e.target.value))}
                            /></td>
                            <td>
                                <button onClick={() => {
                                    removeLayerHandler(layer, index)
                                }}>-
                                </button>
                            </td>
                        </tr>))}
                    </tbody>
                </table>

            </>

        );

    }

    return (
        <Section className="mapinfo-section">
            <SectionItem

                items={
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
            </SectionItem>
        </Section>
    );
}