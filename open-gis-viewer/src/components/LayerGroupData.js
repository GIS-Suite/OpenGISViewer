import React, {useEffect, useState} from "react";
import {Collection} from "ol";
import "./MapInfo.css";
import * as source from "ol/source";

const LayerGroupData = ({
                            layerGroup,
                            onDeleteGroup,
                            handleAddLayer,
                            onSetMapGroup,
                            index,
                            adding,
                        }) => {
    const [group, setGroup] = useState();
    const [addingToGroup, setAddingToGroup] = useState(false);
    useEffect(() => {
        if (layerGroup) {

            setGroup(layerGroup);
        }
    }, [layerGroup]);
    const handleChange = (property, value) => {
        const updatedGroup = {...group};
        switch (property) {
            case 'maxResolution':
                layerGroup.setMaxResolution(value);
                break;
            case 'maxZoom':
                layerGroup.setMaxZoom(value);
                break;
            case 'minResolution':
                layerGroup.setMinResolution(value);
                break;
            case 'minZoom':
                layerGroup.setMinZoom(value);
                break;
            case 'opacity':
                layerGroup.setOpacity(value);
                break;
            case 'visible':
                layerGroup.setVisible(value);
                break;
            case 'zIndex':
                layerGroup.setZIndex(value);
                break;
            default:
                break;
        }
        setGroup(updatedGroup);
    };

    function handleAddLayerToGroup() {
        setAddingToGroup(prevAdding => !prevAdding);
        handleAddLayer(group, !addingToGroup);
        adding(!addingToGroup);
    }

//todo specifics to manipulate min max values on group obj
    return (
        <>
            {layerGroup && <tbody>

            <tr>
                <td>
                    <button className='clear-text-btn'
                            onClick={() => {

                                handleAddLayerToGroup();
                            }}> {addingToGroup ? 'Stop Adding Layers' : 'Add Layers'}</button>
                </td>
                <td>
                    <div
                        className="map-table-scrollable-cnt">{layerGroup.getLayers().getArray().map((layer, index) => (

                        <div className='map-table-data-cell'
                             key={index}>{((layer.getSource() instanceof source.XYZ) ? 'xyz' : ((layer.getSource() instanceof source.GeoTIFF) ? 'geotiff' : (layer.values_.source.params_?.LAYERS ?? layer.values_.source.layer_)))}</div>

                    ))}

                    </div>

                </td>
                <td>
                    <input
                        type="number"
                        value={layerGroup.getMaxResolution() || ''}
                        onChange={(e) => handleChange('maxResolution', parseFloat(e.target.value))}
                    />
                </td>
                <td>
                    <input
                        type="number"
                        value={layerGroup.getMaxZoom() || ''}
                        onChange={(e) => handleChange('maxZoom', parseInt(e.target.value))}
                    />
                </td>
                <td>
                    <input
                        type="number"
                        value={layerGroup.getMinResolution() || ''}
                        onChange={(e) => handleChange('minResolution', parseFloat(e.target.value))}
                    />
                </td>
                <td>
                    <input
                        type="number"
                        value={layerGroup.getMinZoom() || ''}
                        onChange={(e) => handleChange('minZoom', parseInt(e.target.value))}
                    />
                </td>
                <td>
                    <input
                        id="opacity"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={layerGroup.getOpacity() || ''}
                        onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
                    />
                </td>
                <td>
                    <input
                        type="checkbox"
                        checked={layerGroup.getVisible() || false}
                        onChange={(e) => handleChange('visible', e.target.checked)}
                    />
                </td>
                <td>
                    <input
                        type="number"
                        value={layerGroup.getZIndex() || ''}
                        onChange={(e) => handleChange('zIndex', parseInt(e.target.value))}
                    />
                </td>
                <td>
                    <button className='clear-text-btn' onClick={() => onSetMapGroup(index)}>Set</button>
                </td>
                <td>
                    <button className='delete-btn' onClick={() => onDeleteGroup(index)}>Delete</button>
                </td>
            </tr>
            </tbody>}

        </>


    );
};

export default LayerGroupData;