"use client";
import { Cover } from "../../../../components/shared/cover";
import { Toolbar } from "../../../../components/shared/toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import dynamic from "next/dynamic";
import React, { useMemo } from "react";
import "@blocknote/core/style.css";

interface DocumentIdPageProps {
  params: {
    documentId: Id<"documents">;
  };
}

const DocumentIdPage = ({ params }: DocumentIdPageProps) => {
  const document = useQuery(api.document.getDocumentById, {
    id: params.documentId as Id<"documents">,
  });
  const updateFields = useMutation(api.document.updateFields);

  const Editor = useMemo(
    () => dynamic(() => import("@/components/shared/editor"), { ssr: false }),
    []
  );

  if (document === null) return null;

  const onChange = (value: string) => {
    updateFields({ id: params.documentId, content: value });
  };
  if (document === undefined)
    return (
      <div>
        <Cover.Skeleton />
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[80%]" />
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-4 w-[60%]" />
            <Skeleton className="h-4 w-[50%]" />
            <Skeleton className="h-4 w-[40%]" />
          </div>
        </div>
      </div>
    );
  if (document === null) return null;
  return (
    <div className="mt-12">
      <Cover
        url={
          "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=3600"
        }
      />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar document={document} />
        <Editor initialContent={document.content} onChange={onChange} />
      </div>
    </div>
  );
};

export default DocumentIdPage;
