import * as React from 'react';
import { createRoot } from 'react-dom/client';
import Maps from "./components/Maps";
//i did a thing
const rootElement = document.getElementById("root");
ReactDOM.render(
    <React.StrictMode>
        <Maps />
    </React.StrictMode>,
    rootElement
);
