import React, {useEffect, useState} from "react";
import {InputForm} from "./InputForm";
import TileLayer from "ol/layer/Tile";
import * as source from "ol/source";
import {TileWMS, WMTS} from "ol/source";
import DataList from "./DataList";
import {WFS} from "ol/format";
import {optionsFromCapabilities} from "ol/source/WMTS";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBarsStaggered, faPlusCircle, faSync} from '@fortawesome/free-solid-svg-icons';
import LayerGroup from "ol/layer/Group";
import {Collection} from "ol";
import LayerGroupData from "./LayerGroupData";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {Stroke, Style} from "ol/style";
import {Section} from "../UI/Section";
import {SectionItem} from "../UI/SectionItem";
import {NavItemButton} from "./NavItemButton";


export const MapInfo = ({map, onToogleBottomMenu}) => {
    const [selectedTab, setSelectedTab] = useState('Import');
    const [dataLayer, setDataLayer] = useState(null);
    const [showData, setShowData] = useState(false);
    const [layerChanged, setLayerChanged] = useState(false);
    const [mapLayer, setMapLayer] = useState();
    const [draggedIndex, setDraggedIndex] = useState(0);
    const [selectedRowsLayer, setSelectedRowsLayer] = useState([]);
    const [layerGroup, setLayerGroup] = useState([]);
    const [addingToGroup, setAddingToGroup] = useState(false);


    const data = {};

    function selectedLayerHandler(data) {//receives data from input components and  updates here to conditionally display content
        if (data) {
            setShowData(true);
        }
        setDataLayer(data);
    }

    useEffect(() => {//checkpoint to see what layergroup is, if is
        console.log("Create LayerGroupData", layerGroup);

    }, [layerGroup]);

    useEffect(() => {// updates zindex for layers tab,
        if (map && typeof map.getLayers === 'function') {
            // setMapLayer(map.getLayers().getArray());
            const layers = map.getLayers().getArray();
            layers.forEach((layer, index) => {

                layer.setZIndex(index);

            });
            setMapLayer(layers);
        }

    }, [map, mapLayer]);


    useEffect(() => {//another check to see what is going on
        console.log("INFO-MAP:", map);
        if (map && typeof map.getLayerGroup === 'function') {
            console.log("LayerGroup", map.getLayerGroup());
        }


    }, [map, dataLayer, layerChanged])

    function handleFormPopup() {// conditionally handles form appearnace
        setShowData(false);
        if (selectedTab !== 'Import') {
            setSelectedTab('Import');
        }
    }

    function onHandleAddTiff(tiff) {//func to handle geotiff data , add tiff layer to a map object
        console.log("tiff:", tiff);
        map.addLayer(tiff);
    }

    function onSelectLayerHandler(name, type, url, input) {//recieve data, and depending on type of data proceed with addding to map
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


        if (type === "WFS") {
            let test = "https://ahocevar.com/geoserver/wfs?service=WFS&";
            console.log("Passed URL: " + url);
            console.log("Test URL: " + test);
            const vectorSource = new VectorSource();
            const vector = new VectorLayer({
                source: vectorSource,
                style: new Style({
                    stroke: new Stroke({
                        color: "rgba(0, 0, 255, 1.0)",
                        width: 2,
                    }),
                }),
            });

            map.addLayer(vector);
        }
    }

    //handle layers tab, properties get/set of single layer

    function handleVisibilityChange(layer, checked) {
        setLayerChanged(prevState => !prevState);
        layer.setVisible(checked);

    }

    function handleOpacityChange(layer, number) {
        layer.setOpacity(number);
        setLayerChanged(prevState => !prevState);//akward way to update component after change , cause layer.setOpacity dont update state
    }

    //set zindex function if enter on input
    function handleZIndexChange(layer, number) {
        layer.setZIndex(number);
        setLayerChanged(prevState => !prevState);
    }

    function removeLayerHandler(layer) {
        // console.log("Remove", layer.getSource());
        map.removeLayer(layer);
        setLayerChanged(prevState => !prevState);
    }

    function handleSelect(selectedButton) {// func to select tabs
        setSelectedTab(selectedButton);
    }

    let infoContent = <p className="mapinfo-section-no-data">No data available</p>;//define content or else


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
        const setMapGroup = (groupIndex) => {//setting LayerGroup to a map
            if (typeof map.setLayerGroup === 'function') {
                map.setLayerGroup(layerGroup[groupIndex]);
            }

        }
        const updateAddingToGroup = (newState) => {//this update bool that conditionally activates what layer are or not selected
            setAddingToGroup(newState);
        };

        const handleGroupLayers = (layer) => {

            setSelectedRowsLayer(prevSelected => {//selecting layers from a table adding to a state
                return prevSelected.includes(layer)
                    ? prevSelected.filter(name => name !== layer)
                    : [...prevSelected, layer];
            });


        };
        const handleGroupLayerAddition = (group, adding) => {//call this func with single layer and bool to add layers while btn pressed or add added layers to a group
            const addLayersToGroup = (layers) => {
                if (typeof group.setLayers === 'function')
                    group.setLayers(new Collection(layers));
            };

            if (!adding) {

                addLayersToGroup(selectedRowsLayer);
                setSelectedRowsLayer([]);
                setAddingToGroup(prev => !prev);
            }
        };

        const handleCreateLayerGroup = () => {//craete group
            const newLayerGroup = new LayerGroup();
            setLayerGroup(prevLayerGroups => [...prevLayerGroups, newLayerGroup]);
        }
        const handleDeleteLayerGroup = (index) => {//delete a group from layer group array state
            setLayerGroup(prevLayerGroups => {
                const updatedLayerGroups = [...prevLayerGroups];
                updatedLayerGroups.splice(index, 1);
                return updatedLayerGroups;
            });
        };
        const handleDragStart = (e, oldIndex) => {//functionality to drag and drop, on Start
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
                        <tr key={index} onClick={() => addingToGroup && handleGroupLayers(layer)}
                            className={addingToGroup && selectedRowsLayer.includes(layer) ? 'map-table-selected-row' : ''}>

                            <td>
                                <div className="map-table-draggable-cnt">
                                    <button title="Drag" draggable className='hamV-icon'
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragOver={(e) => handleDragOver(e, index)}><FontAwesomeIcon
                                        icon={faBarsStaggered}
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
                            <td>
                                <input
                                    type="number"
                                    min="0"
                                    value={layer.values_.zIndex ?? ''}
                                    onChange={(e) => handleZIndexChange(layer, parseInt(e.target.value))}
                                />
                            </td>
                            <td>
                                <button className='delete-btn' onClick={() => {
                                    removeLayerHandler(layer, index)
                                }}>-
                                </button>
                            </td>
                        </tr>))}


                    </tbody>

                </table>
                <>{layerGroup.length > 0 && <table className="map-table">
                    <thead>
                    <tr>
                        <th colSpan={2}>Layers</th>
                        <td>Max Resolution</td>
                        <td>Max Zoom</td>
                        <td>Min Resolution</td>
                        <td>Min Zoom</td>
                        <th>Opacity</th>
                        <th>Visible</th>
                        <th>ZIndex</th>
                        <th>Set to Map</th>
                        <th>Delete Group</th>
                    </tr>
                    </thead>
                    {layerGroup.map((group, index) => (
                        <LayerGroupData key={index} layerGroup={group}
                                        onDeleteGroup={handleDeleteLayerGroup}
                                        handleAddLayer={handleGroupLayerAddition} onSetMapGroup={setMapGroup}
                                        index={index}
                                        adding={updateAddingToGroup}/>))

                    }</table>}</>

                <><FontAwesomeIcon title="Add Group" icon={faPlusCircle} className='add-group-layer-icon'
                                   onClick={handleCreateLayerGroup}/></>
            </div>
        );
    } else if (selectedTab === "Export") {// here add export functionality, to export map in different ways
        infoContent = (<div className='export-btns-cnt'>
                <button>Export as PNG</button>
                <button>Export KML</button>

            </div>
        )
    }

//main content setup
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

