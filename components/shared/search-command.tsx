"use client";
import { useUser } from "@clerk/clerk-react";
import React, { useEffect } from "react";
import useSearch from "../../hooks/use-search";
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { CommandEmpty } from "cmdk";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { File } from "lucide-react";
import { useRouter } from "next/navigation";

const SearchCommand = () => {
  const { user } = useUser();
  const search = useSearch();
  const { isOpen, onClose, onOpen, onToggle } = search;
  const router = useRouter();
  const documents = useQuery(api.document.getSearch);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "m" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onToggle();
      }
    };
    document.addEventListener("keydown", down);
  });
  const onSelect = (value: string) => {
    router.push("/documents/" + value);
    onClose();
  };
  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput placeholder={`Search ${user?.firstName}'s Notion`} />
      <CommandList>
        <CommandEmpty>No result found.</CommandEmpty>
        <CommandGroup heading="Documents">
          {documents?.map((document) => (
            <CommandItem
              key={document._id}
              value={`${document._id}-${document.title}`}
              title={document.title}
              onSelect={() => {
                onSelect(document._id);
              }}
            >
              {document.icon ? (
                <p className="mr-2 text-[18px]">{document.icon}</p>
              ) : (
                <File className="mr-2 h-4 w-4" />
              )}
              <span>{document.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default SearchCommand;
