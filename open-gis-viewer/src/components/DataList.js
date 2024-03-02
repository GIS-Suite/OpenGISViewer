import React from 'react';
import "./DataList.css";
import * as source from "ol/source";
import DataUpdateTime from "./DataUpdateTime";

export default function DataList({input, onSelectLayer}) {
    //const isXYZLayer = input?.getSource() instanceof source.XYZ;
    let isLayer;
    if (input?.Service?.Name === 'WMS') {
        isLayer = "WMS";
    } else if (input?.ServiceIdentification?.ServiceType === 'WMTS') {
        isLayer = "WMTS";
    } else if (input?.getSource() instanceof source.XYZ) {

        isLayer = "XYZ";
    }


    return (
//WMS   MWS
        <>{isLayer === 'WMS' &&
            <table className="data">
                <thead>
                <tr>
                    <th colSpan="1">Layers</th>
                    <th colSpan="">Abstract</th>
                    <th>Projections</th>
                    <th>Updated</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>

                {input?.Capability?.Layer?.Layer?.map((layer) => (
                    <tr key={layer.Title}>
                        <td colSpan="1">{layer.Name}</td>
                        <td colSpan="1">{layer.Abstract ? layer.Abstract : "No Abstract available"}</td>
                        <td>Projections</td>
                        <td><DataUpdateTime date={new Date(layer?.KeywordList.find((item) => {
                            return item.includes('Layer Update Time');

                        })?.split('=')[1]?.trim())}/></td>
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

        } {

        }
            {//WMTS    WMTS
                isLayer === "WMTS" &&

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
                                    <button //(wmtsCapabilities, layerIdentifier, tileMatrixSet, format, projection
                                        onClick={() => onSelectLayer(layer.Identifier, 'WMTS', input.OperationsMetadata.GetCapabilities.DCP.HTTP.Get[0].href)}>+
                                    </button>
                                </td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>

            }
            {isLayer === 'XYZ' &&

                <table className="data">
                    <thead>
                    <tr>
                        <th>Source</th>
                        <th>Projections</th>
                        <th>Action</th>

                    </tr>
                    </thead>
                    <tbody>


                    <tr>
                        <td>XYZ</td>
                        <td>{input?.sourceChangeKey_.target.projection.code_ ? input?.sourceChangeKey_.target.projection.code_ : "No data"}</td>
                        <td>
                            <button
                                onClick={() => onSelectLayer('', "XYZ", "")}>+
                            </button>
                        </td>
                    </tr>
                    </tbody>
                </table>


            }
            {
                false
            }
        </>
    )
        ;
}