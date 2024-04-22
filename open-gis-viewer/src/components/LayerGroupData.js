import React, {useEffect, useState} from "react";
import {Collection} from "ol";
import "./MapInfo.css";

const LayerGroupData = ({
                            layerGroup,
                            onDeleteGroup,
                            handleAddLayer,
                            onSetMapGroup,
                            setAddingToGroup,
                            addingToGroup
                        }) => {
    const [groups, setGroups] = useState([]);

    useEffect(() => {

        if (layerGroup) {

            setGroups(layerGroup);
        }
    }, [layerGroup]);
    const handleChange = (index, property, value) => {
        setGroups(prevGroups => {
            const updatedGroups = [...prevGroups];
            const groupToUpdate = updatedGroups[index];
            groupToUpdate.set(property, value);
            return updatedGroups;
        });
    };


    function handleToggleAddingToGroup() {
        setAddingToGroup(prev => !prev);
    }

    return (
        <>{layerGroup && <table className="map-table">
            <thead>
            <tr>
                <th>Layers</th>
                <td>Max Resolution</td>
                <td>Max Zoom</td>
                <td>Min Resolution</td>
                <td>Min Zoom</td>
                <th>Visible</th>
                <th>Opacity</th>
                <th>ZIndex</th>
                <th>Delete Group</th>
            </tr>
            </thead>
            <tbody>
            {groups.map((group, index) => (
//wip add min max default ranges
                <tr key={index}>
                    <td>
                        <div
                            className="map-table-scrollable-cnt"> {JSON.stringify(group.getLayers().getArray()) ?? 'n/a'}
                        </div>
                        <button className='clear-text-btn'
                                onClick={() => {
                                    handleAddLayer(group);
                                    handleToggleAddingToGroup();
                                }}> {addingToGroup ? 'Stop Adding Layers' : 'Add Layers'}</button>
                    </td>
                    <td>
                        <input
                            type="number"
                            value={group.getMaxResolution() || ''}
                            onChange={(e) => handleChange(index, 'maxResolution', parseFloat(e.target.value))}
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            value={group.getMaxZoom() || ''}
                            onChange={(e) => handleChange(index, 'maxZoom', parseInt(e.target.value))}
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            value={group.getMinResolution() || ''}
                            onChange={(e) => handleChange(index, 'minResolution', parseFloat(e.target.value))}
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            value={group.getMinZoom() || ''}
                            onChange={(e) => handleChange(index, 'minZoom', parseInt(e.target.value))}
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            value={group.getOpacity() || ''}
                            onChange={(e) => handleChange(index, 'opacity', parseFloat(e.target.value))}
                        />
                    </td>
                    <td>
                        <input
                            type="checkbox"
                            checked={group.getVisible() || false}
                            onChange={(e) => handleChange(index, 'visible', e.target.checked)}
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            value={group.getZIndex() || ''}
                            onChange={(e) => handleChange(index, 'zIndex', parseInt(e.target.value))}
                        />
                    </td>
                    <td>
                        <button className='clear-text-btn' onClick={() => onSetMapGroup(index)}>Set</button>
                    </td>
                    <td>
                        <button className='delete-btn' onClick={() => onDeleteGroup(index)}>Delete</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>}

        </>


    );
};

export default LayerGroupData;