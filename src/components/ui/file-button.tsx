"use client";

import { useRef } from "react";
import { Button } from "./button";
import type { ButtonSize, ButtonVariant } from "./button-styles";

export function FileButton({
  accept,
  onText,
  variant = "secondary",
  size = "sm",
  children,
}: {
  accept: string;
  onText: (text: string, file: File) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button variant={variant} size={size} onClick={() => input.current?.click()}>
        {children}
      </Button>
      <input
        ref={input}
        type="file"
        accept={accept}
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) onText(await file.text(), file);
          e.target.value = "";
        }}
      />
    </>
  );
}
