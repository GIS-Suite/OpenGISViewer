import React from 'react';
import "./DataList.css";

export default function ResultList({ input, onSelectLayer }) {

    return (
        <div className="data-scroll">
            <table className="data">
                <thead>
                {input ? <tr>
                    <th>Layers</th>
                    <th>Abstract</th>
                    <th>Action</th>
                </tr> : null}
                </thead>
                <tbody>
                {input ? (
                    input?.Capability?.Layer?.Layer?.map((layer) => (
                        <tr key={layer.Title}>
                            <td colSpan={1}>{layer.Name}</td>
                            <td >{layer.Abstract ? layer.Abstract : "No Abstract available"}</td>
                            <td><button onClick={() => onSelectLayer(layer.Name)}>+</button></td>
                        </tr>
                    ))
                ) : (
                        null
                )}
                </tbody>
            </table>
        </div>
    );
}