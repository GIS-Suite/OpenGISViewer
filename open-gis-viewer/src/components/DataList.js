import React, {useState} from 'react';
import * as source from "ol/source";
import DataUpdateTime from "./DataUpdateTime";
import {SectionItem} from "../UI/SectionItem";
import "./MapInfo.css";

export default function DataList({input, onSelectLayer}) {
    const [query, setQuery] = useState("");

    let isLayer;
    let filter = <div className='map-table-filter'>
        Filter:
        <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            type="search"
        />

    </div>
    if (input?.Service?.Name.includes('WMS')) {
        isLayer = "WMS";
    } else if (input?.ServiceIdentification?.ServiceType.includes('WMTS')) {
        isLayer = "WMTS";
    } else if (input?.getSource() instanceof source.XYZ) {

        isLayer = "XYZ";
        filter = null;
    }
    return (<SectionItem items={input ? filter : null} SectionContainer="div">
            {isLayer === 'WMS' &&
                <table className="map-table">
                    <thead>
                    <tr>
                        <th>Layers</th>
                        <th>Abstract</th>
                        <th>Projections</th>
                        <th>Updated</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>

                    {input?.Capability?.Layer?.Layer?.filter(layer => layer.Name.toLowerCase().includes(query.toLowerCase())).map((layer) => (
                        <tr key={layer.Title}>
                            <td>{layer.Name}</td>
                            <td>{layer.Abstract ? layer.Abstract : "No Abstract available"}</td>
                            <td>{layer.CRS ?? "N/A"} </td>
                            <td>{layer.KeywordList ? <DataUpdateTime date={new Date(layer?.KeywordList.find((item) => {
                                return item.includes('Layer Update Time');

                            })?.split('=')[1]?.trim())}/> : "N/A"}
                            </td>
                            <td>
                                <button className='add-btn'
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

                <table className="map-table">
                    <thead>
                    <tr>
                        <th>Identifier</th>
                        <th>Title</th>
                        <th>Update Time</th>
                        <th>Action</th>

                    </tr>
                    </thead>
                    <tbody>
                    {
                        input?.Contents?.Layer?.filter(layer => layer.Identifier.toLowerCase().includes(query.toLowerCase())).map((layer, index) => (
                            <tr key={index}>
                                <td>{layer.Identifier}</td>
                                <td>{layer.Title ? layer.Title : "No Abstract available"}</td>
                                <td>{layer.Keywords ? <DataUpdateTime date={new Date(layer.Keywords.find((item) => {
                                    return item.includes('Layer Update Time');

                                })?.split('=')[1]?.trim())}/> : "N/A"}</td>
                                <td>
                                    <button //(wmtsCapabilities, layerIdentifier, tileMatrixSet, format, projection
                                        className='add-btn'
                                        onClick={() => onSelectLayer(layer.Identifier, 'WMTS', input.OperationsMetadata.GetCapabilities.DCP.HTTP.Get[0].href, input)}>+
                                    </button>
                                </td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>

            }
            {isLayer === 'XYZ' &&

                <table className="map-table">
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
                            <button className='add-btn'
                                    onClick={() => onSelectLayer('', "XYZ", "")}>+
                            </button>
                        </td>
                    </tr>
                    </tbody>
                </table>


            }
            {
                !isLayer && <p>No data imported</p>
            }
        </SectionItem>


    );
}