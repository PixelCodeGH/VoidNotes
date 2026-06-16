import React, { useCallback, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView, lineNumbers, highlightActiveLine, highlightActiveLineGutter, keymap } from "@codemirror/view";
import { EditorSelection, Prec } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { bracketMatching, indentOnInput, indentUnit } from "@codemirror/language";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { autocompletion, closeBrackets, closeBracketsKeymap, CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { vim } from "@replit/codemirror-vim";

interface NoteEditorProps {
  content: string;
  onChange: (value: string) => void;
  noteNames: string[];
  vimMode?: boolean;
  readableLineLength?: boolean;
  editorFont?: string;
  spellcheck?: boolean;
  onCursorChange?: (line: number, col: number, mode: string) => void;
}

const SLASH_COMMANDS: { label: string; insert: string | (() => string) }[] = [
  { label: "Heading 1", insert: "# " },
  { label: "Heading 2", insert: "## " },
  { label: "Heading 3", insert: "### " },
  { label: "Bullet list", insert: "- " },
  { label: "Numbered list", insert: "1. " },
  { label: "Task list", insert: "- [ ] " },
  { label: "Quote", insert: "> " },
  { label: "Code block", insert: "```\n\n```" },
  { label: "Table", insert: "| Header | Header |\n|--------|--------|\n| Cell   | Cell   |" },
  { label: "Divider", insert: "---\n" },
  { label: "Date", insert: () => new Date().toISOString().split("T")[0] },
  { label: "Time", insert: () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
  { label: "Callout info", insert: "> [!INFO]\n> " },
  { label: "Callout warning", insert: "> [!WARNING]\n> " },
];

function slashCommandCompletion(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/\/[^\s]*/);
  if (!word) return null;
  const query = word.text.slice(1).toLowerCase();
  const options = SLASH_COMMANDS
    .filter((cmd) => cmd.label.toLowerCase().includes(query))
    .map((cmd) => ({
      label: `/${cmd.label}`,
      type: "keyword" as const,
      apply: (view: EditorView, _completion: any, from: number, to: number) => {
        const insert = typeof cmd.insert === "function" ? cmd.insert() : cmd.insert;
        view.dispatch({ changes: { from, to, insert } });
      },
    }));
  return { from: word.from, options };
}

function wrapSelection(view: EditorView, marker: string): boolean {
  const changes = view.state.changeByRange((range) => {
    const selected = view.state.sliceDoc(range.from, range.to);
    const alreadyWrapped = selected.startsWith(marker) && selected.endsWith(marker);
    if (alreadyWrapped) {
      const unwrapped = selected.slice(marker.length, -marker.length);
      return {
        changes: { from: range.from, to: range.to, insert: unwrapped },
        range: selected.length === 0
          ? EditorSelection.cursor(range.from + marker.length)
          : EditorSelection.range(range.from, range.from + unwrapped.length),
      };
    }
    const replacement = `${marker}${selected}${marker}`;
    return {
      changes: { from: range.from, to: range.to, insert: replacement },
      range: selected.length === 0
        ? EditorSelection.cursor(range.from + marker.length)
        : EditorSelection.range(range.from, range.to + marker.length * 2),
    };
  });
  view.dispatch(changes);
  view.focus();
  return true;
}

const markdownKeymap = Prec.high(keymap.of([
  { key: "Ctrl-b", run: (view) => wrapSelection(view, "**") },
  { key: "Ctrl-i", run: (view) => wrapSelection(view, "*") },
]));

function wikiLinkCompletion(noteNames: string[]) {
  return (context: CompletionContext): CompletionResult | null => {
    const word = context.matchBefore(/\[\[[^\]]*/);
    if (!word) return null;

    const query = word.text.slice(2).toLowerCase();
    const options = noteNames
      .filter((name) => name.toLowerCase().includes(query))
      .map((name) => ({
        label: name.replace(/\.md$/, ""),
        type: "text",
      }));

    return {
      from: word.from + 2,
      options,
    };
  };
}

export default function NoteEditor({ content, onChange, noteNames, vimMode, readableLineLength, editorFont, spellcheck = true, onCursorChange }: NoteEditorProps) {
  const wikiCompletion = useMemo(
    () => autocompletion({
      override: [wikiLinkCompletion(noteNames), slashCommandCompletion],
      activateOnTyping: true,
    }),
    [noteNames]
  );

  const dynamicTheme = useMemo(() => {
    const styles: Record<string, any> = {
      "&": {
        backgroundColor: "transparent",
        color: "var(--text-primary)",
      },
      ".cm-content": {
        caretColor: "var(--accent)",
        fontFamily: editorFont || "var(--font-mono)",
        fontSize: "var(--font-size-md)",
        lineHeight: "var(--line-height)",
      },
    };

    if (readableLineLength) {
      styles[".cm-content"] = {
        ...styles[".cm-content"],
        maxWidth: "80ch",
        margin: "0 auto",
      };
    }

    return EditorView.theme(styles, { dark: false });
  }, [readableLineLength, editorFont]);

  const cursorListener = useMemo(() => EditorView.updateListener.of((update) => {
    if (!onCursorChange) return;
    if (update.selectionSet || update.docChanged) {
      const pos = update.state.selection.main.head;
      const line = update.state.doc.lineAt(pos);
      const col = pos - line.from + 1;
      onCursorChange(line.number, col, vimMode ? "Vim" : "Edit");
    }
  }), [onCursorChange, vimMode]);

  const extensions = useMemo(() => {
    const exts = [
      lineNumbers(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      history(),
      bracketMatching(),
      closeBrackets(),
      indentUnit.of("  "),
      indentOnInput(),
      highlightSelectionMatches(),
      keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap, ...closeBracketsKeymap]),
      markdownKeymap,
      dynamicTheme,
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ spellcheck: spellcheck ? "true" : "false" }),
      cursorListener,
      wikiCompletion,
    ];
    if (vimMode) {
      exts.unshift(vim());
    }
    return exts;
  }, [wikiCompletion, vimMode, dynamicTheme]);

  const handleChange = useCallback((value: string) => {
    onChange(value);
  }, [onChange]);

  return (
    <CodeMirror
      value={content}
      onChange={handleChange}
      extensions={extensions}
      theme="dark"
      height="100%"
      style={{ height: "100%" }}
    />
  );
}
