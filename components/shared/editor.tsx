import { useTheme } from "next-themes";
import { BlockNoteView, useBlockNote } from "@blocknote/react";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
interface EditotProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}
const Editor = ({ onChange, editable, initialContent }: EditotProps) => {
  const { resolvedTheme } = useTheme();
  const editor: BlockNoteEditor = useBlockNote({
    editable,
    initialContent: initialContent
      ? (JSON.parse(initialContent) as PartialBlock[])
      : undefined,
    onEditorContentChange: (editor) => {
      onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
    },
  });
  return (
    <BlockNoteView
      editor={editor}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
};
export default Editor;
