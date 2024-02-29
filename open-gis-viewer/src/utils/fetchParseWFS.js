import { WFS } from "ol/format";

export const fetchWfsService = async (url) => {
  const data = await fetch(`${url}`)
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error(error));
};
