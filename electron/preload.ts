import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  // Window
  minimize: () => ipcRenderer.invoke("window:minimize"),
  maximize: () => ipcRenderer.invoke("window:maximize"),
  close: () => ipcRenderer.invoke("window:close"),
  setBackground: (color: string) => ipcRenderer.invoke("window:set-background", color),
  setOpacity: (opacity: number) => ipcRenderer.invoke("window:set-opacity", opacity),

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
  renameNote: (oldName: string, newName: string) => ipcRenderer.invoke("notes:rename", oldName, newName),
  statNote: (fileName: string) => ipcRenderer.invoke("notes:stat", fileName),
  moveNote: (fileName: string, targetFolder: string) => ipcRenderer.invoke("notes:move", fileName, targetFolder),
});
