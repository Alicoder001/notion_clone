"use client";
import { Search, Trash, Undo } from "lucide-react";
import React, { useState } from "react";
import { Input } from "../../../components/ui/input";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Loader } from "../../../components/ui/loader";
import { ConfirmModal } from "../../../components/modals/confirm-modal";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";
import useSubscription from "../../../hooks/use-subscription";

export const TrashBox = () => {
  const router = useRouter();
  const params = useParams();
  const documents = useQuery(api.document.getTrashDocuments);
  const remove = useMutation(api.document.remove);
  const [search, setSearch] = useState("");
  console.log(params);
  const allDocuments = useQuery(api.document.getAllDocuments, {});
  const { user } = useUser();
  const restore = useMutation(api.document.restore);
  const { plan, isLoading } = useSubscription(
    user?.emailAddresses[0].emailAddress!
  );
  if (documents === undefined) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Loader size={"lg"} />
      </div>
    );
  }
  const filteredDocuments = documents.filter((document) => {
    return document.title
      .toLocaleLowerCase()
      .includes(search.toLocaleLowerCase());
  });
  const onRemove = (documentId: Id<"documents">) => {
    const promise = remove({ id: documentId });
    if (params.documentId === documentId) {
      router.push("/documents");
    }
    toast.promise(promise, {
      loading: "Removing document...",
      success: "Document removed successfully!",
      error: "Failed to remove document",
    });
  };
  const onRestore = (documentId: Id<"documents">) => {
    if (allDocuments?.length && allDocuments.length >= 3 && plan === "Free") {
      toast.error(
        "You already have 3 notes. Please  delete one to restore this note."
      );
      return;
    }
    const promise = restore({ id: documentId });
    toast.promise(promise, {
      loading: "Restoring document...",
      success: "Document restored successfully.",
      error: "Failed to restore document.",
    });
    router.push("/documents");
  };
  return (
    <div className="text-sm">
      <div className="flex items-center gap-x-1 p-2">
        <Search className="w-4 h-4 " />
        <Input
          className="h-7 px-2 focus-visible:ring-transparent bg-secondary"
          placeholder="Filter by page title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="mt-2 px-1 pb-1">
        <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
          No documents in trash
        </p>
        {filteredDocuments?.map((document) => (
          <div
            className="text-sm rounded-sm w-full hover:bg-primary/5 flex items-center text-primary justify-between"
            key={document._id}
            role="button"
            onClick={(e) => router.push(`/documents/${document._id}`)}
          >
            <span className="truncate pl-2">{document.title}</span>
            <div className="flex items-center">
              <div
                className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                role="button"
              >
                <Undo
                  onClick={() => {
                    onRestore(document._id);
                  }}
                  className="h-4 w-4 text-muted-foreground"
                />
              </div>
              <ConfirmModal onConfirm={() => onRemove(document._id)}>
                <div
                  className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                  role="button"
                >
                  <Trash className="h-4 w-4 text-muted-foreground" />
                </div>
              </ConfirmModal>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
