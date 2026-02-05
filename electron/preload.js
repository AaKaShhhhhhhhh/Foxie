const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ping: () => ipcRenderer.invoke('ping'),
  invokeLLM: (payload) => ipcRenderer.invoke('invoke-llm', payload),
  onTamboEvent: (cb) => ipcRenderer.on('tambo-event', (_e, ...args) => cb(...args)),
});
