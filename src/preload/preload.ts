import { contextBridge, ipcRenderer } from 'electron';

// Expose APIs to the renderer process
contextBridge.exposeInMainWorld('api', {
    // Example function to send a message to the main process
    sendMessage: (channel: string, data: any) => {
        ipcRenderer.send(channel, data);
    },
    // Example function to receive a message from the main process
    onMessage: (channel: string, func: (data: any) => void) => {
        ipcRenderer.on(channel, (event, data) => func(data));
    }
});