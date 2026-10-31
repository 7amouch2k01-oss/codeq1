import React from "react";
import Editor, { type OnMount } from "@monaco-editor/react";

interface CodeEditorProps {
  language?: string;
  value: string;
  onChange: (val: string) => void;
  height?: string;
  readOnly?: boolean;
}

export function CodeEditor({
  language = "python",
  value,
  onChange,
  height = "320px",
  readOnly = false,
}: CodeEditorProps) {
  const handleMount: OnMount = (editor, monaco) => {
    // Custom retro/dark theme matching Questbound style
    monaco.editor.defineTheme("questboundTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6b7280", fontStyle: "italic" },
        { token: "keyword", foreground: "10b981", fontStyle: "bold" },
        { token: "string", foreground: "fbbf24" },
        { token: "number", foreground: "38bdf8" },
        { token: "identifier", foreground: "e0e7ff" },
      ],
      colors: {
        "editor.background": "#0b0f19",
        "editor.foreground": "#e2e8f0",
        "editor.lineHighlightBackground": "#161e2e",
        "editorLineNumber.foreground": "#475569",
        "editorLineNumber.activeForeground": "#10b981",
        "editorCursor.foreground": "#10b981",
      },
    });
    monaco.editor.setTheme("questboundTheme");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 shadow-inner">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(val) => onChange(val || "")}
        onMount={handleMount}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          lineNumbers: "on",
          lineNumbersMinChars: 3,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          tabSize: 4,
          insertSpaces: true,
          wordWrap: "on",
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
