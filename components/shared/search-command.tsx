"use client";
import { useUser } from "@clerk/clerk-react";
import React from "react";
import useSearch from "../../hooks/use-search";

const SearchCommand = () => {
  const { user } = useUser();
  const search = useSearch();
  const { isOpen, onClose, onOpen, onToggle } = search;
  return <div>SearchCommand</div>;
};

export default SearchCommand;
