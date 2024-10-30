import React, { useRef, useState } from "react";
import { Doc } from "../../../convex/_generated/dataModel";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Skeleton } from "../../../components/ui/skeleton";

interface TitleProps {
  document: Doc<"documents">;
}

const Title = ({ document }: TitleProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const updateFields = useMutation(api.document.updateFields);

  const [title, setTitle] = useState(document.title || "Untitled");
  const [isEditing, setIsEditing] = useState(false);

  const enableInput = () => {
    setTitle(document.title);
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(0, inputRef.current.value.length);
    }, 0);
  };
  const disableInput = () => {
    setIsEditing(false);
  };
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
    updateFields({ id: document._id, title: event.target.value });
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      disableInput();
    }
  };
  return (
    <div className="flex items-center gap-x-1">
      {!!document.icon && <p>{document.icon}</p>}
      {isEditing ? (
        <Input
          ref={inputRef}
          onClick={enableInput}
          onBlur={disableInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={title}
          className="h-7 px-2 focus-visible:ring-transparent"
        />
      ) : (
        <>
          <Button
            className="font-normal h-auto p-1"
            variant={"ghost"}
            size={"sm"}
            onClick={enableInput}
          >
            <span className="truncate">{document.title}</span>
          </Button>
        </>
      )}
    </div>
  );
};

export default Title;

Title.skeleton = function Titleskelaton() {
  return <Skeleton className="h-5 w-10 rounded-md" />;
};
