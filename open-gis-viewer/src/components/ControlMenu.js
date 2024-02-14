
import "./ControlMenu.css";
import * as React from 'react';
import {useState} from "react";


export default function ControlMenu({onHandleLayers}) {
    const [layerType, setLayerType] = useState('XYZ');
    const [layerUrl, setLayerUrl] = useState('');

    return (
        <div className="side-container">

            <div className="content">
                <h2 className="side-title">Controls</h2>

                <select value={layerType} onChange={(e) => setLayerType(e.target.value)}>
                    <option value="XYZ">XYZ (Tile) Layer</option>
                    <option value="WFS">WFS (Tile) Layer</option>
                    <option value="WMF">WMF (Tile) Layer</option>
                </select>
                <input
                    type="text"
                    value={layerUrl}
                    onChange={(e) => setLayerUrl(e.target.value)}
                    placeholder="Enter layer URL"
                />
                <button className="control-btn" onClick={() => onHandleLayers ({ layerType: layerType, layersUrl: layerUrl})}>Add Layer</button>
            </div>
        </div>
    );
}