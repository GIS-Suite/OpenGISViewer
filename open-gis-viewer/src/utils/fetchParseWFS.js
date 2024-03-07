import { WFS } from "ol/format";

export const fetchWfsService = async (url) => {
  const parser = new WFS();

  const data = await fetch(`${url}`)
    .then((data) => console.log(data))
    .catch((error) => console.error(error));

  return parser.readFeature(data);
};
