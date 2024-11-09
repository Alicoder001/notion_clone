"use client";
import React, { useEffect, useState } from "react";
import SettingModal from "../modals/settings-modal";

export default function ModalProvider() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return (
    <>
      <SettingModal />
    </>
  );
}
