const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('deadZoneWindow', {
  getState:()=>ipcRenderer.invoke('window:get'),
  setMode:mode=>ipcRenderer.invoke('window:mode',mode),
  setSize:(width,height)=>ipcRenderer.invoke('window:size',width,height),
  minimize:()=>ipcRenderer.invoke('window:minimize'),
  maximize:()=>ipcRenderer.invoke('window:maximize'),
  close:()=>ipcRenderer.invoke('window:close'),
  storeChapter:payload=>ipcRenderer.invoke('chapter:store',payload),
  readChapter:()=>ipcRenderer.invoke('chapter:read'),
  clearChapter:()=>ipcRenderer.invoke('chapter:clear'),
  onState:callback=>{
    const listener=(_event,state)=>callback(state);
    ipcRenderer.on('window:state',listener);
    return ()=>ipcRenderer.removeListener('window:state',listener);
  }
});
