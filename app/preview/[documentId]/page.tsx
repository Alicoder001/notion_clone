"use client";
import React, { useMemo } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import dynamic from "next/dynamic";
import { Cover } from "../../../components/shared/cover";
import { Skeleton } from "../../../components/ui/skeleton";
import { Toolbar } from "../../../components/shared/toolbar";

interface DocumentIdPageProps {
  params: {
    documentId: Id<"documents">;
  };
}
export default function Page({ params }: DocumentIdPageProps) {
  const document = useQuery(api.document.getDocumentById, {
    id: params.documentId,
  });

  const Editor = useMemo(
    () =>
      dynamic(() => import("@/components/shared/editor"), {
        ssr: false,
      }),
    []
  );
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
  return (
    <div className="pb-40">
      <Cover url={document.coverImage} preview />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar document={document} preview />
        <Editor
          initialContent={document.content}
          editable={false}
          onChange={() => {}}
        />
      </div>
    </div>
  );
}
