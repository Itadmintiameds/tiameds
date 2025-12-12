"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";

interface DetailedReportTiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  height?: string;
}

const DetailedReportTiptapEditor: React.FC<DetailedReportTiptapEditorProps> = ({
  value,
  onChange,
  height = "500px",
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "",
    onUpdate: ({ editor }: { editor: Editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Keep external value and editor content in sync when value changes from outside
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value && value !== current) {
      editor.commands.setContent(value, false);
    }
    // We intentionally skip editor from deps to avoid infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) {
    return (
      <div
        className="w-full border border-gray-200 rounded-md bg-gray-50"
        style={{ minHeight: height }}
      />
    );
  }

  return (
    <div
      className="border border-gray-200 rounded-md overflow-hidden bg-white"
      style={{ minHeight: height }}
    >
      <div className="border-b border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 flex items-center gap-2">
        <span className="font-medium">Detailed Report Editor</span>
        <span className="text-gray-400">
          (Supports tables, headings, lists and rich text)
        </span>
      </div>
      <div className="p-2 report-html">
        <EditorContent editor={editor} className="prose prose-sm max-w-none" />
      </div>
    </div>
  );
};

export default DetailedReportTiptapEditor;

