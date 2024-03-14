// KMZImporter.js
import JSZip from 'jszip';
import { parseString } from 'xml2js';

// Function to handle KMZ file import
export const handleKMZFile = async (file) => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onload = async function (event) {
            const kmzData = event.target.result;

            // Use JSZip to unzip the KMZ file
            JSZip.loadAsync(kmzData).then(async function (zip) {
                // Assume there's only one KML file in the KMZ file
                const kmlFile = Object.values(zip.files).find(file => file.name.endsWith('.kml'));

                if (kmlFile) {
                    // Read the KML file content
                    const kmlContent = await kmlFile.async('text');

                    // Parse the KML content using xml2js
                    parseString(kmlContent, (err, result) => {
                        if (err) {
                            reject(err); // Reject promise on parsing error
                        } else {
                            resolve(result); // Resolve promise with parsed KML data
                        }
                    });
                } else {
                    reject(new Error('No KML file found in the KMZ archive.')); // Reject promise if no KML file found
                }
            }).catch(error => {
                reject(error); // Reject promise on JSZip error
            });
        };

        // Read the KMZ file as a binary string
        reader.readAsArrayBuffer(file);
    });
};
