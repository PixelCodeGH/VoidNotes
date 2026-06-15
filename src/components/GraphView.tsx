import React from "react";

interface GraphViewProps {
  notes: string[];
  backlinks: Map<string, string[]>;
  activeNote: string | null;
  onNodeClick: (note: string) => void;
  onClose: () => void;
}

export default function GraphView({ notes, backlinks, activeNote, onNodeClick, onClose }: GraphViewProps) {
  return (
    <div className="graph-view">
      <div className="graph-header">
        <h3 className="graph-title">Graph View</h3>
        <button className="btn-icon" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div className="graph-canvas" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "24px" }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-muted)" }}>
          <circle cx="12" cy="12" r="2"/>
          <circle cx="5" cy="6" r="2"/>
          <circle cx="19" cy="6" r="2"/>
          <circle cx="5" cy="18" r="2"/>
          <circle cx="19" cy="18" r="2"/>
          <line x1="12" y1="10" x2="5" y2="8"/>
          <line x1="12" y1="10" x2="19" y2="8"/>
          <line x1="12" y1="14" x2="5" y2="16"/>
          <line x1="12" y1="14" x2="19" y2="16"/>
        </svg>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center" }}>
          Graph view coming soon.<br/>
          {notes.length} notes, {Array.from(backlinks.values()).flat().length} connections
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", maxHeight: "400px", overflow: "auto" }}>
          {notes.slice(0, 50).map((note) => (
            <button
              key={note}
              className="btn-secondary"
              style={{ fontSize: "12px", padding: "4px 8px" }}
              onClick={() => onNodeClick(note)}
            >
              {note.replace(/\.md$/, "").split("/").pop()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
