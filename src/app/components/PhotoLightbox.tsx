"use client";
import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export default function PhotoLightbox({ src, alt, width, height }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        onClick={() => setOpen(true)}
        style={{ borderRadius: "4px", objectFit: "cover", flexShrink: 0, border: "1px solid #30363d", cursor: "zoom-in" }}
      />
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}
        >
          <img
            src={src}
            alt={alt}
            style={{ maxHeight: "80vh", maxWidth: "80vw", borderRadius: "8px", border: "2px solid #30363d", objectFit: "contain" }}
          />
        </div>
      )}
    </>
  );
}
