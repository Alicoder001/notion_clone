"use client";
import { useUser } from "@clerk/clerk-react";
import React from "react";
import { Button } from "../../../components/ui/button";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useSubscription from "../../../hooks/use-subscription";
import { Loader } from "../../../components/ui/loader";

const SecretPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const createDocument = useMutation(api.document.createDocument);
  const documents = useQuery(api.document.getDocuments, {});
  const { plan, isLoading } = useSubscription(
    user?.emailAddresses[0].emailAddress!
  );
  const onCreateDocument = () => {
    if (documents?.length && documents.length >= 3 && plan === "Free") {
      toast.error("You can only create 3 documents in the free plan");
      return;
    }
    const promise = createDocument({ title: "Untitled" }).then((docId) =>
      router.push(`/documents/${docId}`)
    );
    toast.promise(promise, {
      loading: "Creating a new blank...",
      success: "Created a new blank.",
      error: "Failed to create a new blank.",
    });
  };
  return (
    <div className="h-screen w-full flex justify-center items-center space-y-4 flex-col">
      <Image
        src={"/note.svg"}
        alt="note"
        width={300}
        height={300}
        className="object-cover dark:hidden"
      />
      <Image
        src={"/note-dark.svg"}
        alt="note"
        width={300}
        height={300}
        className="object-cover hidden dark:block"
      />
      <h2 className="text-lg font-bold">{`Welcome to ${user?.firstName}'s page`}</h2>
      <Button onClick={onCreateDocument} disabled={isLoading}>
        {isLoading ? (
          <>
            {" "}
            <Loader />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {" "}
            <Plus className="h-4 w-4 mr-2" />
            Create a blank
          </>
        )}
      </Button>
    </div>
  );
};

export default SecretPage;
