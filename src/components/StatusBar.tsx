import React, { useMemo } from "react";

interface StatusBarProps {
  content: string;
  noteCount: number;
  activeNote: string | null;
  saved: boolean;
  cursor?: { line: number; col: number; mode: string };
  vimMode?: boolean;
}

export default function StatusBar({ content, noteCount, activeNote, saved, cursor, vimMode }: StatusBarProps) {
  const wordCount = useMemo(() => {
    if (!content.trim()) return 0;
    return content.trim().split(/\s+/).length;
  }, [content]);

  const charCount = content.length;

  const lineCount = useMemo(() => {
    if (!content) return 0;
    return content.split("\n").length;
  }, [content]);

  return (
    <div className="status-bar">
      <div className="status-bar-section">
        <span className="status-item">
          <span className="status-dot" style={{ background: saved ? "#98c379" : "#e5c07b" }} />
          {saved ? "Saved" : "Editing"}
        </span>
        {vimMode && cursor && <span className="status-item status-mode">{cursor.mode}</span>}
        <span className="status-item">{noteCount} notes</span>
        {activeNote && (
          <span className="status-item">
            {wordCount} words &middot; {charCount} chars &middot; {lineCount} lines
          </span>
        )}
        {cursor && activeNote && (
          <span className="status-item">Ln {cursor.line}, Col {cursor.col}</span>
        )}
      </div>
      <div className="status-bar-section">
        <span className="status-item">Ctrl+P Search</span>
        <span className="status-item">Ctrl+E Preview</span>
      </div>
    </div>
  );
}
