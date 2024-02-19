import React from 'react';
import "./ResultList.css";

export default function ResultList({ input, onSelectLayer }) {


    return (
        <>
                <table className="result">
                    <thead>
                    <tr>
                        <th>Layers</th>
                        <th>Abstract</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {input?.Capability?.Layer?.Layer?.map((layer) => (
                        <tr key={layer.Title}>
                            <td>{layer.Name}</td>
                            <td>{layer.Abstract ? layer.Abstract : "No Abstract available"}</td>
                            <td><button onClick={() => onSelectLayer(layer.Name)}>Add Layer</button> </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

        </>
    );
}