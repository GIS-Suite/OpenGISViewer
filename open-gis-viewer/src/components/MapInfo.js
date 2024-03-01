import React, {useEffect, useState} from 'react';
import {Section} from "../UI/Section";
import {SectionItem} from "../UI/SectionItem";
import {NavItemButton} from "./NavItemButton";
import "./MapInfo.css";
import {InputForm} from "./InputForm";
import TileLayer from "ol/layer/Tile";
import {TileWMS, WMTS} from "ol/source";
import DataList from "./DataList";
import {createWmtsLayer} from "../utils/WMTSHandler";
import * as source from "ol/source";
import {WFS} from "ol/format";


export const MapInfo = ({map, onToogleBottomMenu}) => {
    const [selectedTab, setSelectedTab] = useState('Import');
    const [dataLayer, setDataLayer] = useState(null);
    const [showData, setShowData] = useState(false);
    const [opacity, setOpacity] = useState('');
    const [zIndex, setZIndex] = useState(0);
    const [visibleLayer, setVisibleLayer] = useState(true);
    const [layerRemoved, setLayerRemoved] = useState(false);

    const data = {};

    function selectedLayerHandler(data) {

        if (data) {
            setShowData(true);
        }

        setDataLayer(data);
    }

    console.log("InfoMap: ", map);
    console.log("layer to add:", data);
    useEffect(() => {
        console.log("INFOMAP:", map);

    }, [map, dataLayer])

    function handleFormPopup() {

        setShowData(!showData);
        setSelectedTab('Import');
    }

    function onSelectLayerHandler(name, type, url) {
        //  const baseUrl = new URL(url).origin + new URL(url).pathname.split('/').slice(0, 3).join('/');
        if (type === 'WMS') {
            const newLayer = new TileLayer({
                source: new TileWMS({

                    // url: 'https://geoint.nrlssc.org/nrltileserver/wms',
                    url: url,
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
            // const newLayer = createWmtsLayer(wmtsCapabilities, layerIdentifier, tileMatrixSet, format, projection);

            //map?.addLayer(newLayer); //ad layer  to map that u get from creatWMTS func
        }
        if (type === 'XYZ') {
            console.log("xyz", dataLayer);
            map.addLayer(dataLayer);
            console.log(map?.getLayers().getArray());
        }
    }

    function handleVisibilityChange(layer, checked) {

        layer.setVisible(checked);
        setVisibleLayer(layer.getVisible());
    }

    function handleOpacityChange(layer, number, index) {
        layer.setOpacity(number);
        setOpacity(layer.getOpacity());
    }

    function handleZIndexChange(layer, number) {
        layer.setZIndex(number);
        setZIndex(layer.getZIndex());
    }

    function removeLayerHandler(layer) {
        // console.log("Remove", layer.getSource());

        map.removeLayer(layer);
        setLayerRemoved(prevState => !prevState);
    }

    function handleSelect(selectedButton) {
        setSelectedTab(selectedButton);
    }

    let infoContent = <p className="mapinfo-section-no-data">No data available</p>;

    if (selectedTab === "Import") {
        infoContent = (
            <div className="mapinfo-content">
                {!showData && <InputForm onHandleAddLayer={selectedLayerHandler} onAddXYZLayer={onSelectLayerHandler}/>}
                {showData &&
                    <DataList input={dataLayer} onSelectLayer={onSelectLayerHandler}/>
                }
            </div>
        );
    } else if (selectedTab === "Layers") {
        console.log("L", map.getLayers().getArray());

        let layer = map.getLayers().getArray();


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
                            {/*{layer.getSource() instanceof source.XYZ ? 'XYZ' : layer.values_.source.params_.LAYERS}*/}
                            <td>   {(() => {
                                if (layer.getSource() instanceof WMTS) {
                                    return 'WMTS ';
                                } else if (layer.getSource() instanceof source.TileWMS) {
                                    return 'WMS ';
                                } else if (layer.getSource() instanceof WFS) {
                                    return 'WFS ';
                                } else if (layer.getSource() instanceof source.XYZ) {
                                    return 'XYZ';
                                } else {
                                    return 'Unknown ';
                                }
                            })()}
                                {(layer.getSource() instanceof source.XYZ) ? '' : layer.values_.source.params_.LAYERS}</td>
                            <td><input
                                type="checkbox"
                                checked={layer.values_.visible}
                                onChange={(e) => handleVisibilityChange(layer, e.target.checked)}
                            /></td>
                            <td><input
                                id="opacity"
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={layer.values_.opacity}
                                onChange={(e) => handleOpacityChange(layer, parseFloat(e.target.value), index)}
                            /></td>
                            <td><input
                                type="number"
                                min="0"
                                value={layer.values_.zIndex}
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
                        <div>
                            <button onClick={handleFormPopup}>
                                Form
                            </button>
                            <button onClick={onToogleBottomMenu}>Hide</button>
                        </div>
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