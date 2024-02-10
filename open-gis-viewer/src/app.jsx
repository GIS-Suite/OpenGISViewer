import * as React from 'react';
import { createRoot } from 'react-dom/client';
import Maps from "./components/Maps";

const mapNode  = document.getElementById('root');
const root  = createRoot(mapNode);

root.render(<><Maps/></>);
