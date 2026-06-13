import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  // Window
  minimize: () => ipcRenderer.invoke("window:minimize"),
  maximize: () => ipcRenderer.invoke("window:maximize"),
  close: () => ipcRenderer.invoke("window:close"),

  // Vault
  selectVault: () => ipcRenderer.invoke("vault:select"),
  setVault: (p: string) => ipcRenderer.invoke("vault:set", p),
  getVault: () => ipcRenderer.invoke("vault:get"),

  // Notes
  listNotes: () => ipcRenderer.invoke("notes:list"),
  loadNote: (fileName: string) => ipcRenderer.invoke("notes:load", fileName),
  saveNote: (fileName: string, content: string) => ipcRenderer.invoke("notes:save", fileName, content),
  createNote: (folder?: string) => ipcRenderer.invoke("notes:create", folder),
  deleteNote: (fileName: string) => ipcRenderer.invoke("notes:delete", fileName),
  statNote: (fileName: string) => ipcRenderer.invoke("notes:stat", fileName),
});
