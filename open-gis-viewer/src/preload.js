// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld(
    // Object containing the APIs to expose
    'electron',
    {
        // Example API to send a message to the main process
        send: (channel, data) => {
            ipcRenderer.send(channel, data);
        }
    }
);