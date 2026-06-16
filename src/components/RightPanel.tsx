import React, { useMemo, useState, useEffect } from "react";
import matter from "gray-matter";
import { parseFrontmatter } from "../plugins/frontmatter";

interface RightPanelProps {
  activeNote: string | null;
  content: string;
  backlinks: string[];
  tags: string[];
  onNavigate: (note: string) => void;
  onContentChange?: (value: string) => void;
  activePanelTab: string;
  onPanelTabChange: (tab: string) => void;
}

interface OutlineItem {
  level: number;
  text: string;
  line: number;
}

type PanelTab = "backlinks" | "tags" | "outline" | "properties" | "unlinked" | "calendar";

function extractHeadings(content: string): OutlineItem[] {
  const headings: OutlineItem[] = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,6})\s+(.+)/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1"),
        line: i,
      });
    }
  }
  return headings;
}

function frontmatterToYaml(data: Record<string, unknown>): string {
  if (Object.keys(data).length === 0) return "";
  const full = matter.stringify("", data);
  return full.replace(/^---\n/, "").replace(/\n---\n$/, "");
}

export default function RightPanel({ activeNote, content, backlinks, tags, onNavigate, onContentChange, activePanelTab, onPanelTabChange }: RightPanelProps) {
  const headings = useMemo(() => extractHeadings(content), [content]);
  const parsed = useMemo(() => parseFrontmatter(content), [content]);
  const [yamlText, setYamlText] = useState("");
  const [yamlError, setYamlError] = useState<string | null>(null);

  useEffect(() => {
    setYamlText(frontmatterToYaml(parsed.data));
    setYamlError(null);
  }, [parsed.data, activeNote]);

  const handleApplyProperties = () => {
    if (!onContentChange) return;
    try {
      const newData = yamlText.trim() ? matter(`---\n${yamlText}\n---`).data : {};
      const newRaw = matter.stringify(parsed.content, newData);
      onContentChange(newRaw);
      setYamlError(null);
    } catch (err: any) {
      setYamlError(err?.message || "Invalid YAML");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="right-panel">
      <div className="panel-tabs">
        <button title="Backlinks" className={`panel-tab ${activePanelTab === "backlinks" ? "active" : ""}`} onClick={() => onPanelTabChange("backlinks")}>Backlinks</button>
        <button title="Tags" className={`panel-tab ${activePanelTab === "tags" ? "active" : ""}`} onClick={() => onPanelTabChange("tags")}>Tags</button>
        <button title="Outline" className={`panel-tab ${activePanelTab === "outline" ? "active" : ""}`} onClick={() => onPanelTabChange("outline")}>Outline</button>
        <button title="Properties" className={`panel-tab ${activePanelTab === "properties" ? "active" : ""}`} onClick={() => onPanelTabChange("properties")}>Properties</button>
      </div>
      <div className="panel-tabs panel-tabs-secondary">
        <button title="Unlinked mentions" className={`panel-tab ${activePanelTab === "unlinked" ? "active" : ""}`} onClick={() => onPanelTabChange("unlinked")}>Unlinked</button>
        <button title="Calendar" className={`panel-tab ${activePanelTab === "calendar" ? "active" : ""}`} onClick={() => onPanelTabChange("calendar")}>Calendar</button>
      </div>
      <div className="panel-content">
        {activePanelTab === "backlinks" && (
          <div className="panel-section">
            {backlinks.length === 0 ? <div className="panel-empty">No backlinks found</div> : backlinks.map((note) => (
              <button key={note} className="panel-item" onClick={() => onNavigate(note)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span>{note.replace(/\.md$/, "")}</span>
              </button>
            ))}
          </div>
        )}
        {activePanelTab === "tags" && (
          <div className="panel-section">
            {tags.length === 0 ? <div className="panel-empty">No tags found</div> : tags.map((tag) => (
              <span key={tag} className="panel-tag">#{tag}</span>
            ))}
          </div>
        )}
        {activePanelTab === "outline" && (
          <div className="panel-section">
            {headings.length === 0 ? <div className="panel-empty">No headings found</div> : headings.map((h, i) => (
              <button key={i} className="panel-outline-item" style={{ paddingLeft: `${(h.level - 1) * 12 + 8}px` }}>
                <span className="outline-level">H{h.level}</span>
                <span className="outline-text">{h.text}</span>
              </button>
            ))}
          </div>
        )}
        {activePanelTab === "properties" && (
          <div className="panel-section properties-panel">
            <p className="panel-hint">Edit YAML frontmatter for this note.</p>
            <textarea
              className="properties-editor"
              value={yamlText}
              onChange={(e) => setYamlText(e.target.value)}
              placeholder={`title: My Note\ntags:\n  - idea\ndate: ${today}`}
              spellCheck={false}
            />
            {yamlError && <div className="properties-error">{yamlError}</div>}
            <button className="btn-secondary properties-apply" onClick={handleApplyProperties} disabled={!onContentChange}>Apply</button>
          </div>
        )}
        {activePanelTab === "unlinked" && (
          <div className="panel-section">
            <div className="panel-empty">Unlinked mentions — coming soon</div>
          </div>
        )}
        {activePanelTab === "calendar" && (
          <div className="panel-section calendar-panel">
            <div className="panel-empty">Calendar view — coming soon</div>
            <div className="calendar-grid">
              {Array.from({ length: 28 }, (_, i) => (
                <div key={i} className="calendar-day">{i + 1}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
