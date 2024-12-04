"use client";

import React, { useMemo } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { Block, BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { useTheme } from "next-themes";
import { useEdgeStore } from "../../lib/edgestore";
import "@blocknote/mantine/style.css";

interface EditorProps {
  initialContent?: string;
  onChange: (blocks: Block[]) => void;
  editable?: boolean;
}

const Editor = ({ initialContent, onChange, editable = true }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();
  const handleUpload = async (file: File) => {
    const res = await edgestore.publicFiles.upload({ file });
    return res.url;
  };
  const initialContentParsed = useMemo(() => {
    try {
      const parsedContent = initialContent
        ? (JSON.parse(initialContent) as PartialBlock[])
        : [];

      return parsedContent.length > 0
        ? parsedContent
        : [{ type: "paragraph", content: "" }];
    } catch (error) {
      console.error("Invalid JSON for initial content:", error);
      return [{ type: "paragraph", content: "" }];
    }
  }, [initialContent]);

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialContentParsed as PartialBlock[],
    uploadFile: handleUpload,
  });

  return (
    <div>
      <BlockNoteView
        onChange={() => {
          if (editor) {
            onChange(editor.document);
          }
        }}
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        editable={editable}
      />
    </div>
  );
};

export default Editor;
