import React, { useState, useEffect, useCallback } from "react";

interface TemplatesPanelProps {
  onInsertTemplate: (content: string) => void;
  onClose: () => void;
}

const DEFAULT_TEMPLATES = [
  {
    name: "Daily Note",
    content: `# {{date}}

## Tasks
- [ ] 

## Notes

## Links
`,
  },
  {
    name: "Meeting Notes",
    content: `# Meeting: {{title}}

**Date:** {{date}}
**Attendees:** 

## Agenda

## Discussion

## Action Items
- [ ] 

## Next Meeting
`,
  },
  {
    name: "Project",
    content: `# Project: {{title}}

## Overview

## Goals

## Tasks
- [ ] 

## Resources

## Notes
`,
  },
  {
    name: "Book Notes",
    content: `# {{title}}

**Author:** 
**Rating:** /5
**Date Read:** {{date}}

## Summary

## Key Takeaways

## Quotes

## Notes
`,
  },
  {
    name: "Journal",
    content: `# {{date}}

## How I'm Feeling

## What Happened Today

## Gratitude

## Tomorrow
`,
  },
];

function replaceVars(template: string): string {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  return template
    .replace(/\{\{date\}\}/g, date)
    .replace(/\{\{title\}\}/g, "Untitled");
}

export default function TemplatesPanel({ onInsertTemplate, onClose }: TemplatesPanelProps) {
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);

  const handleInsert = useCallback((content: string) => {
    onInsertTemplate(replaceVars(content));
    onClose();
  }, [onInsertTemplate, onClose]);

  return (
    <div className="templates-panel">
      <div className="templates-header">
        <h3 className="templates-title">Templates</h3>
        <button className="btn-icon" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div className="templates-list">
        {templates.map((template) => (
          <button
            key={template.name}
            className="template-item"
            onClick={() => handleInsert(template.content)}
          >
            <span className="template-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </span>
            <span className="template-name">{template.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
