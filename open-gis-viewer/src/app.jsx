import * as React from 'react';
import { createRoot } from 'react-dom/client';
import Maps from "./components/Maps";

const rootElement = document.getElementById("root");
ReactDOM.render(
    <React.StrictMode>
        <Maps />
    </React.StrictMode>,
    rootElement
    //
);