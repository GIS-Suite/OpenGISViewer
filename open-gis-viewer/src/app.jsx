import * as React from "react";
import { createRoot } from "react-dom/client";
import AppContainer from "./components/AppContainer";

const mapNode = document.getElementById("root");
const root = createRoot(mapNode);

root.render(
  <>
    <AppContainer />
  </>
);
