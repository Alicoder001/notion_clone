"use client";

import React, { useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import dynamic from "next/dynamic";
import { Id } from "../../../../convex/_generated/dataModel";
import { Cover } from "../../../../components/shared/cover";
import { Skeleton } from "../../../../components/ui/skeleton";
import { Toolbar } from "../../../../components/shared/toolbar";
import { Block } from "@blocknote/core";

interface DocumentIdPageProps {
  params: {
    documentId: Id<"documents">;
  };
}

const DocumentIdPage = ({ params }: DocumentIdPageProps) => {
  // Fetch document data
  const document = useQuery(api.document.getDocumentById, {
    id: params.documentId,
  });

  // Mutation to update fields
  const updateFields = useMutation(api.document.updateFields);

  // Dynamically import Editor component
  const Editor = useMemo(
    () =>
      dynamic(() => import("@/components/shared/editor"), {
        ssr: false,
      }),
    []
  );

  // Fallback if document is undefined or null
  if (!document) {
    return (
      <div>
        {document === undefined ? (
          <>
            <Cover.Skeleton />
            <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
              <div className="space-y-4 pl-8 pt-4">
                <Skeleton className="h-14 w-[50%]" />
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-[40%]" />
                <Skeleton className="h-4 w-[60%]" />
              </div>
            </div>
          </>
        ) : null}
      </div>
    );
  }

  const onChange = (blocks: Block[]) => {
    const newContent = JSON.stringify(blocks);
    if (newContent !== document.content) {
      updateFields({ id: document._id, content: newContent });
    }
  };

  return (
    <div className="pb-40">
      <Cover url={document.coverImage} />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar document={document} />
        <Editor initialContent={document.content} onChange={onChange} />
      </div>
    </div>
  );
};

export default DocumentIdPage;
