"use client";
import {
  ChevronsLeft,
  MenuIcon,
  Plus,
  Rocket,
  Search,
  Settings,
  Trash,
} from "lucide-react";
import React, { ElementRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../lib/utils";
import { useMediaQuery } from "usehooks-ts";
import { DocumentList } from "../../(home)/components/document-list";
import { Item } from "./item";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { UserBox } from "./user-box";
import { Progress } from "../../../components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { TrashBox } from "./trash-box";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "./navbar";
import useSearch from "../../../hooks/use-search";
import useSetting from "../../../hooks/use-settings";
import { useUser } from "@clerk/clerk-react";
import useSubscription from "../../../hooks/use-subscription";
import { Loader } from "../../../components/ui/loader";

export const Sidebar = () => {
  const { user } = useUser();

  const isMobile = useMediaQuery("(max-width:770px)");
  const params = useParams();
  const router = useRouter();
  const sidebarRef = useRef<ElementRef<"div">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const isResizing = useRef(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [isResetting, setIsResetting] = useState(false);
  const { isLoading, plan } = useSubscription(
    user?.emailAddresses[0].emailAddress!
  );

  const documents = useQuery(api.document.getAllDocuments, {});
  console.log(documents);
  const createDocument = useMutation(api.document.createDocument);
  const setting = useSetting();
  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      reset();
    }
  }, [isMobile]);

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);
      sidebarRef.current.style.width = "0";
      navbarRef.current.style.width = "100%";
      navbarRef.current.style.left = "0px";
      setTimeout(() => {
        setIsResetting(false);
      }, 3000);
    }
  };
  const reset = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);
      sidebarRef.current.style.width = isMobile ? "100%" : "240px";
      navbarRef.current.style.width = isMobile ? "0" : "calc(100% - 240px)";
      navbarRef.current.style.left = isMobile ? "100%" : "240px";
      setTimeout(() => {
        setIsResetting(false);
      }, 3000);
    }
  };
  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizing.current) return;

    let newWidth = event.clientX;

    if (newWidth < 240) {
      newWidth = 240;
    }
    if (newWidth > 400) {
      newWidth = 400;
    }
    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.width = `calc(100% - ${newWidth}px)`;
      navbarRef.current.style.left = `${newWidth}px`;
    }
  };
  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const onCreateDocument = () => {
    if (documents?.length && documents.length >= 3 && plan === "Free") {
      toast.error("You can only create 3 documents in the free plan");
      return;
    }
    console.log(documents?.length);
    const promise = createDocument({ title: "Untitled" }).then((docId) =>
      router.push(`/documents/${docId}`)
    );
    toast.promise(promise, {
      loading: "Creating a new document...",
      success: "Created a new document.",
      error: "Failed to create a new document.",
    });
  };

  const search = useSearch();
  const arr = [1];
  return (
    <>
      <div
        className={cn(
          "group/sidebar h-screen bg-secondary overflow-y-auto  flex w-60 flex-col z-50 sticky left-0 top-0",
          isResetting && "transition-all ease-in duration-300",
          isMobile && "w-0"
        )}
        ref={sidebarRef}
      >
        <div
          className={cn(
            "h-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
            isMobile && "opacity-100"
          )}
          role="button"
          onClick={collapse}
        >
          <ChevronsLeft className="h-6 w-6" />
        </div>

        <div>
          <UserBox />
          <Item
            label="Search"
            Icon={Search}
            isSearch
            onClick={() => search.onOpen()}
          />
          <Item
            label="Settings"
            Icon={Settings}
            isSettings
            onClick={() => {
              setting.onOpen();
            }}
          />
          <Item label="New Document" Icon={Plus} onClick={onCreateDocument} />
        </div>
        <div className="mt-4">
          <DocumentList plan={plan} />
          <Item label="Add a page" Icon={Plus} onClick={onCreateDocument} />

          <Popover>
            <PopoverTrigger className="w-full mt-4">
              <Item label="Trash" Icon={Trash} />
            </PopoverTrigger>
            <PopoverContent
              className="p-0 w-72"
              side={isMobile ? "bottom" : "right"}
            >
              <TrashBox />
            </PopoverContent>
          </Popover>
        </div>

        <div
          className={cn(
            "absolute right-0 top-0 w-1 h-full cursor-ew-resize bg-primary/10 opacity-0 group-hover/sidebar:opacity-100 transition",
            isMobile && "hidden"
          )}
          onMouseDown={handleMouseDown}
        />

        <div className="absolute bottom-0 px-2 bg-white/50 dark:bg-black/50 py-4 w-full">
          {isLoading ? (
            <div className="w-full flex justify-center items-center">
              <Loader />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-[13px]">
                  <Rocket />
                  <p className="opacity-70 font-bold">{plan} Plan</p>
                </div>
                {plan === "Free" ? (
                  <p className="text-[13px] opacity-70">
                    {documents?.length}/3
                  </p>
                ) : (
                  <p className="text-[13px] opacity-70">
                    {documents?.length} notes
                  </p>
                )}
              </div>
              {plan == "Free" && (
                <Progress
                  className="mt-2"
                  value={
                    documents?.length && documents.length >= 3
                      ? 100
                      : (documents?.length || 0) * 33.33
                  }
                />
              )}
            </>
          )}
        </div>
      </div>
      <div
        className={cn(
          "absolute top-0 z-50 left-60 w-[calc(100%-240px)] ",
          isResetting && "transition-all ease-in duration-300",
          isMobile && "w-full left-0"
        )}
        ref={navbarRef}
      >
        {params.documentId ? (
          <Navbar isCollapsed={isCollapsed} reset={reset} />
        ) : (
          <nav className=" bg-transparent px-3 py-2 w-full">
            {isCollapsed && (
              <MenuIcon
                className=" h-6 w-6 text-muted-foreground"
                role="button"
                onClick={reset}
              />
            )}
          </nav>
        )}
      </div>
    </>
  );
};
