import React, { useState, useEffect } from "react";

export interface Workspace {
  name: string;
  sidebarWidth: number;
  showRightPanel: boolean;
  splitView: boolean;
  splitRatio: number;
  theme: string;
  focusMode: boolean;
  rightPanelTab: string;
}

interface WorkspacesPanelProps {
  currentLayout: Workspace;
  onLoadWorkspace: (workspace: Workspace) => void;
  onClose: () => void;
}

const STORAGE_KEY = "void-workspaces";

export default function WorkspacesPanel({ currentLayout, onLoadWorkspace, onClose }: WorkspacesPanelProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  });
  const [newName, setNewName] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
  }, [workspaces]);

  const handleSave = () => {
    const name = newName.trim() || `Workspace ${workspaces.length + 1}`;
    setWorkspaces((prev) => {
      const next = prev.filter((w) => w.name !== name);
      return [...next, { ...currentLayout, name }];
    });
    setNewName("");
  };

  const handleDelete = (name: string) => {
    setWorkspaces((prev) => prev.filter((w) => w.name !== name));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Workspaces</h2>
          <button className="btn-icon" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="settings-section">
            <div className="settings-label">Save current layout</div>
            <p className="settings-hint">Capture the current sidebar width, panels, split view, and theme.</p>
            <div style={{ display: "flex", gap: "var(--space-sm)", marginTop: "var(--space-sm)" }}>
              <input
                className="rename-input"
                placeholder="Workspace name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              />
              <button className="btn-secondary" onClick={handleSave}>Save</button>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-label">Saved workspaces</div>
            {workspaces.length === 0 ? (
              <p className="settings-hint">No saved workspaces yet.</p>
            ) : (
              <div className="workspaces-list">
                {workspaces.map((ws) => (
                  <div key={ws.name} className="workspace-item">
                    <div className="workspace-info">
                      <span className="workspace-name">{ws.name}</span>
                      <span className="workspace-meta">
                        {ws.theme} · {ws.showRightPanel ? "panel" : "no panel"} · {ws.splitView ? "split" : "single"} · {ws.focusMode ? "focus" : "normal"}
                      </span>
                    </div>
                    <div className="workspace-actions">
                      <button className="btn-secondary" onClick={() => onLoadWorkspace(ws)}>Load</button>
                      <button className="btn-secondary" onClick={() => handleDelete(ws.name)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
