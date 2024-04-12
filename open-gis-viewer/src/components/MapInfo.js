import React, {useEffect, useState} from 'react';
import {Section} from "../UI/Section";
import {SectionItem} from "../UI/SectionItem";
import {NavItemButton} from "./NavItemButton";
import "./MapInfo.css";
import {InputForm} from "./InputForm";
import TileLayer from "ol/layer/Tile";
import {TileWMS, WMTS} from "ol/source";
import DataList from "./DataList";
import * as source from "ol/source";
import {WFS} from "ol/format";
import {optionsFromCapabilities} from "ol/source/WMTS";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSync, faEllipsisV} from '@fortawesome/free-solid-svg-icons';


export const MapInfo = ({map, onToogleBottomMenu}) => {
    const [selectedTab, setSelectedTab] = useState('Import');
    const [dataLayer, setDataLayer] = useState(null);
    const [showData, setShowData] = useState(false);
    const [layerChanged, setLayerChanged] = useState(false);
    const [mapLayer, setMapLayer] = useState();
    const [draggedIndex, setDraggedIndex] = useState(0);
    const data = {};

    function selectedLayerHandler(data) {
        if (data) {
            setShowData(true);
        }
        setDataLayer(data);
    }

    useEffect(() => {
        if (map && typeof map.getLayers === 'function') {
            // setMapLayer(map.getLayers().getArray());
            const layers = map.getLayers().getArray();
            layers.forEach((layer, index) => {

                layer.setZIndex(index);

            });
            setMapLayer(layers);
        }

    }, [map, mapLayer]);


    useEffect(() => {
        console.log("INFO-MAP:", map);

    }, [map, dataLayer, layerChanged])

    function handleFormPopup() {

        setShowData(false);
        if (selectedTab !== 'Import') {
            setSelectedTab('Import');
        }
    }

    function onHandleAddTiff(tiff) {
        console.log("tiff:", tiff);
        map.addLayer(tiff);
    }

    function onSelectLayerHandler(name, type, url, input) {
        //  const baseUrl = new URL(url).origin + new URL(url).pathname.split('/').slice(0, 3).join('/');
        if (type === 'WMS') {
            const newLayer = new TileLayer({
                source: new TileWMS({
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
            // const newLayer = createWmtsLayer(name, tileMatrixSet, format, projection);
            const options = optionsFromCapabilities(input, {
                layer: name,
            });
            const newLayer = new TileLayer({

                source: new WMTS(options),
            })
            console.log(newLayer);
            map?.addLayer(newLayer); //ad layer  to map that u get from creatWMTS func
        }
        if (type === 'XYZ') {
            console.log("xyz", dataLayer);
            map.addLayer(dataLayer);
            console.log(map?.getLayers().getArray());
        }
    }

    function handleVisibilityChange(layer, checked) {
        setLayerChanged(prevState => !prevState);
        layer.setVisible(checked);

    }

    function handleOpacityChange(layer, number) {
        layer.setOpacity(number);
        setLayerChanged(prevState => !prevState);
    }

    /*//set zindex function if enter on input
     function handleZIndexChange(layer, number) {
           layer.setZIndex(number);
           setLayerChanged(prevState => !prevState);
       }*/

    function removeLayerHandler(layer) {
        // console.log("Remove", layer.getSource());
        map.removeLayer(layer);
        setLayerChanged(prevState => !prevState);
    }

    function handleSelect(selectedButton) {
        setSelectedTab(selectedButton);
    }

    let infoContent = <p className="mapinfo-section-no-data">No data available</p>;


    if (selectedTab === "Import") {
        infoContent = (
            <div className="mapinfo-content">
                {!showData && <InputForm onHandleAddLayer={selectedLayerHandler}
                                         onHandleTiff={onHandleAddTiff}/>}
                {showData &&
                    <DataList input={dataLayer} onSelectLayer={onSelectLayerHandler}/>
                }
            </div>
        );
    } else if (selectedTab === "Layers") {

        const handleDragStart = (e, oldIndex) => {

            setDraggedIndex(oldIndex);
            console.log("BeforeUpdateArrayOrder", mapLayer);
        };

        const handleDragOver = (e, newIndex) => {
            e.preventDefault();
            const oldIndex = draggedIndex;

            if (oldIndex !== newIndex) {
                const updatedLayers = [...mapLayer];
                const movedLayer = updatedLayers.splice(oldIndex, 1)[0];
                updatedLayers.splice(newIndex, 0, movedLayer);

                updatedLayers.forEach((layer, index) => {
                    layer.setZIndex(index);
                });
                console.log("AfterUpdatedArrayOrder", updatedLayers);
                //  setMapLayer(updatedLayers);
                map.setLayers(updatedLayers);
                setDraggedIndex(newIndex);
            }
        };
        infoContent = (
            <div className="map-table-scroll">
                <table className="map-table">
                    <thead>
                    <tr>
                        <th>Layer Name</th>
                        <th>Visible</th>
                        <th>Opacity</th>
                        <th>Refresh</th>
                        <th>ZIndex</th>
                        <th>Delete</th>
                    </tr>
                    </thead>

                    <tbody>
                    {mapLayer?.map((layer, index) => (
                        <tr key={index}>

                            <td style={{
                                display: 'flex',

                            }}>
                                <button draggable className='ellipsisV-icon'
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={(e) => handleDragOver(e, index)}><FontAwesomeIcon icon={faEllipsisV}
                                />
                                </button>
                                <div>
                                    <div className='map-table-text'>  {(() => {
                                        if (layer.getSource() instanceof WMTS) {
                                            return 'WMTS ';
                                        } else if (layer.getSource() instanceof source.TileWMS) {
                                            return 'WMS ';
                                        } else if (layer.getSource() instanceof WFS) {
                                            return 'WFS ';
                                        } else if (layer.getSource() instanceof source.XYZ) {
                                            return 'XYZ';
                                        } else if (layer.getSource() instanceof source.GeoTIFF) {
                                            return 'GeoTIFF';
                                        } else {
                                            return 'Unknown ';
                                        }
                                    })()}
                                        {((layer.getSource() instanceof source.XYZ) ? '' : layer.values_.source.params_?.LAYERS) ?? layer.values_.source.layer_}
                                    </div>

                                </div>
                            </td>
                            <td><input
                                id='visible'
                                type="checkbox"
                                checked={layer.values_.visible}
                                onChange={(e) => handleVisibilityChange(layer, e.target.checked)}
                            />
                            </td>
                            <td><input
                                id="opacity"
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={layer.values_.opacity}
                                onChange={(e) => handleOpacityChange(layer, parseFloat(e.target.value), index)}
                            /></td>
                            <td>
                                <FontAwesomeIcon icon={faSync} className='refresh-icon'
                                                 onClick={() => layer.getSource().refresh()}/>
                            </td>
                            <td>{/* set up zindex manually
                            <input
                                type="number"
                                min="0"
                                value={layer.values_.zIndex ?? ''}
                                onChange={(e) => handleZIndexChange(layer, parseInt(e.target.value))}
                            />*/}
                                {layer.values_.zIndex ?? ''}</td>
                            <td>
                                <button className='delete-btn' onClick={() => {
                                    removeLayerHandler(layer, index)
                                }}>-
                                </button>
                            </td>
                        </tr>))}
                    </tbody>
                </table>
            </div>
        );
    } else if (selectedTab === "Export") {
        infoContent = (<div>
                <button>Export as PNG</button>
                <button>Export KML</button>

            </div>
        )
    }


    return (
        <Section className="mapinfo-section">
            <SectionItem
                items={
                    <>
                        <div>
                            <button onClick={handleFormPopup}>
                                Search
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