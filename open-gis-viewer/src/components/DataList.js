import React from 'react';
import "./DataList.css";

export default function DataList({input, onSelectLayer}) {

    return (
//WMS
        <>{input?.Service?.Name === 'WMS' && <div className="data-scroll">
            <table className="data">
                <thead>
                <tr>
                    <th>Layers</th>
                    <th>Update Time</th>
                    <th>Abstract</th>
                    <th> Projections</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>

                {input?.Capability?.Layer?.Layer?.map((layer) => (
                    <tr key={layer.Title}>
                        <td>{layer.Name}</td>
                        <td>{layer.Abstract ? layer.Abstract : "No Abstract available"}</td>
                        <td>
                            <button
                                onClick={() => onSelectLayer(layer.Name, 'WMS', input.Capability.Request.GetCapabilities.DCPType[0].HTTP.Get.OnlineResource)}>

                                +
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>} {

        }
            {//WMTS
                input?.ServiceIdentification?.ServiceType === 'WMTS' &&
                <div className="data-scroll">
                    <table className="data">
                        <thead>
                        <tr>
                            <th>Identifier</th>
                            <th>Title</th>
                            <th>Action</th>

                        </tr>
                        </thead>
                        <tbody>
                        {
                            input?.Contents?.Layer?.map((layer, index) => (
                                <tr key={index}>
                                    <td>{layer.Identifier}</td>
                                    <td>{layer.Title ? layer.Title : "No Abstract available"}</td>
                                    <td>
                                        <button
                                            onClick={() => onSelectLayer(layer.Identifier, 'WMTS', input.OperationsMetadata.GetCapabilities.DCP.HTTP.Get[0].href)}>+
                                        </button>
                                    </td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                </div>

            }
            {/* {//show XYZ
                <ul>
                    <li>XYZ</li>
                    <li>Projection Code: {input?.sourceChangeKey_.target.projection.code_}</li>
                    <li>URLs: {input?.sourceChangeKey_.urls}</li>
                </ul>}*/
            }
            {
                false
            }
        </>
    )
        ;
}