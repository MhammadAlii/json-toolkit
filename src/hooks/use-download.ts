"use client";

import { useCallback } from "react";

export function useDownload() {
  return useCallback((data: BlobPart, filename: string, mime = "application/json") => {
    const url = URL.createObjectURL(new Blob([data], { type: mime }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);
}
