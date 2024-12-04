import React from "react";
import { cn } from "../../lib/utils";
import Image from "next/image";
import { Button } from "../ui/button";
import { ImageIcon, X } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useCoverImage } from "../../hooks/use-cover-image";
import { useEdgeStore } from "../../lib/edgestore";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";
interface CoverProps {
  url?: string;
  preview?: boolean;
}
export const Cover = ({ url, preview }: CoverProps) => {
  const params = useParams();
  const coverImage = useCoverImage();
  const { edgestore } = useEdgeStore();
  const updateFields = useMutation(api.document.updateFields);

  const onRemove = async () => {
    if (url) {
      await edgestore.publicFiles.delete({ url });
    }
    updateFields({
      id: params.documentId as Id<"documents">,
      coverImage: "",
    });
  };
  return (
    <div
      className={cn(
        "relative w-full h-[30vh] group",
        !url ? "h-[10vh]" : "bg-muted"
      )}
    >
      {!!url && <Image fill src={url} alt="cover" className="object-cover" />}
      {!!url && !preview && (
        <div className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-20 flex items-center gap-x-2">
          <Button
            className="text-muted-foreground text-xs"
            size={"sm"}
            variant={"outline"}
            onClick={() => coverImage.onReplace(url)}
          >
            <ImageIcon />
            <span>Change cover</span>
          </Button>
          <Button
            className="text-muted-foreground text-xs"
            size={"sm"}
            variant={"outline"}
            onClick={onRemove}
          >
            <X />
            <span>Remove</span>
          </Button>
        </div>
      )}
    </div>
  );
};

Cover.Skeleton = function CoverSkeletion() {
  return <Skeleton className="w-full h-[12vh]" />;
};
