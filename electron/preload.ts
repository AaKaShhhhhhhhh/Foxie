import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  ping: () => ipcRenderer.invoke('ping'),
  invokeLLM: (payload: any) => ipcRenderer.invoke('invoke-llm', payload),
  onTamboEvent: (cb: (...args: any[]) => void) => ipcRenderer.on('tambo-event', (_e, ...args) => cb(...args)),
});
