"use client";

import { useEffect, useState } from "react";

// Copies a value (a Whish number, an IBAN) and says "Copied" for two seconds.
// The value is also shown as text next to it, so a guest can still long-press
// and copy it in browsers that block the clipboard (some in-app browsers do).
type Props = { value: string; label: string; done: string };

export function CopyButton({ value, label, done }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard not allowed here: the visible text is the fallback.
    }
  }

  return (
    <button type="button" className="pill" onClick={copy} aria-live="polite">
      {copied ? done : label}
    </button>
  );
}
