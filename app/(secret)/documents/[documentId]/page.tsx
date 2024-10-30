"use client";
import { Id } from "../../../../convex/_generated/dataModel";

interface DocumentIdPageProps {
  params: {
    documentId: Id<"documents">;
  };
}

const DocumentIdPage = ({ params }: DocumentIdPageProps) => {
  return <div className="mt-12">{params.documentId}</div>;
};

export default DocumentIdPage;
