import {fromArrayBuffer, fromBlob} from "geotiff";
import ImageCanvasSource from "ol/source/ImageCanvas";
import ImageLayer from "ol/layer/Image";


export async function handleFileSelect(file) {


    const tiff = await fromBlob(file);
    const image = await tiff.getImage();
    const data = await image.readRasters();
    const width = image.getWidth();
    const height = image.getHeight();
    const tileWidth = image.getTileWidth();
    const tileHeight = image.getTileHeight();
    const samplesPerPixel = image.getSamplesPerPixel();
    const resolution = image.getResolution();
    const extent = image.getBoundingBox();
    console.log(image);


    const source = new ImageCanvasSource({
        canvasFunction: function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = tileWidth;
            canvas.height = tileHeight;
            return canvas;
        },
        interpolate: false,
        ratio: 1,
        resolutions: resolution,

        extent: extent,
    });
    //console.log("Data", data, image, imgurl);
    return new ImageLayer({
        source: source,

    });
}

/*
            const canvasSource = new ImageCanvasSource({
                canvasFunction: function (extent, resolution, pixelRatio, size, projection) {
                    const canvas = document.createElement('canvas');
                    canvas.width = image.getWidth();
                    canvas.height = image.getHeight();
                    const ctx = canvas.getContext('2d');

                    // Calculate scaling factor for the canvas
                    const scaleX = canvas.width / width;
                    const scaleY = canvas.height / height;

                    // Draw raster
                    data.forEach((row, y) => {
                        row.forEach((value, x) => {
                            // Pixel value to color
                            ctx.fillStyle = `rgba(${value}, ${value}, ${value}, 1)`;

                            // Map pixel coordinates to canvas coordinates
                            const canvasX = x * scaleX;
                            const canvasY = y * scaleY;

                            // Draw pixel on canvas
                            ctx.fillRect(canvasX, canvasY, scaleX, scaleY);
                        });
                    });

                    return canvas;
                },
                projection: 'EPSG:4326',
                imageExtent: extent, // Set image extent
            });


 */
// Convert raster data to an image format


/*  const source = new ImageCanvasSource({
      canvasFunction: function (extent, resolution) {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const pixelSizeX = resolution[0] * tileWidth;
          const pixelSizeY = resolution[1] * tileHeight;
          const ctx = canvas.getContext('2d');
          const transform = [
              pixelSizeX, 0, 0,
              0, -pixelSizeY, 0,
              0, height * pixelSizeY, 1
          ];

          data.forEach((row, y) => {
              row.forEach((value, x) => {

                  ctx.fillStyle = `rgba(${value}, ${value}, ${value}, 1)`;

                  const canvasX = x * transform[0] + y * transform[1] + transform[2];
                  const canvasY = x * transform[3] + y * transform[4] + transform[5];

                  ctx.fillRect(canvasX, canvasY, 1, 1);

              });
          });

          return canvas;
      },
      projection: 'EPSG:4256',
      imageExtent: extent // Set extent of the image
  });*/

/*   return new GeoTIFFImage({
       source: image,

   });*/


/*      const layer = new ImageLayer({
          source: new GeoTIFF({
              source: [{
                  image: image,
              }],
              convertToRGB: true,
              normalize: true,
          }),
      });
*/

/*
            resolve(layer);
        } catch (error) {
            reject(new Error('Error reading or processing file: ' + error));
        }
    });
}*/
