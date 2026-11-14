"use client";

import { useState } from "react";
import { initials } from "@/lib/initials";
import styles from "./dashboard.module.css";

// The guest list: search, filters, and for each guest their status and two
// small actions (open their invitation, copy their link). Only this part of
// the dashboard runs in the browser.

export type Row = {
  key: string;
  name: string;
  seats: number; // seats reserved (0 for shared-link replies)
  status: "yes" | "no" | "waiting";
  count: number;
  message: string;
  repliedOn: string; // "2 Mar", empty while waiting
  link?: string; // the guest's personal invitation path
  shared?: boolean; // replied through the shared link
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "yes", label: "Accepted" },
  { id: "no", label: "Declined" },
  { id: "waiting", label: "Waiting" },
] as const;

type Filter = (typeof FILTERS)[number]["id"];

export function GuestList({ rows }: { rows: Row[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const shown = rows.filter(
    (r) => (filter === "all" || r.status === filter) && (!q || r.name.toLowerCase().includes(q)),
  );

  async function copy(row: Row) {
    if (!row.link) return;
    try {
      await navigator.clipboard.writeText(location.origin + row.link);
      setCopied(row.key);
      window.setTimeout(() => setCopied((k) => (k === row.key ? null : k)), 2000);
    } catch {
      // Clipboard blocked: the "open" link is still there.
    }
  }

  return (
    <section className={styles.panel} aria-label="Guests">
      <div className={styles.panelHead}>
        <h2 className={styles.h2}>Guests</h2>
        <label className={styles.search}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" />
          </svg>
          <input
            type="search"
            placeholder="Search a name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search a guest"
          />
        </label>
      </div>

      <div className={styles.filters}>
        {FILTERS.map((f) => {
          const n = f.id === "all" ? rows.length : rows.filter((r) => r.status === f.id).length;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              className={styles.filter}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
              <span>{n}</span>
            </button>
          );
        })}
      </div>

      <ul className={styles.rows}>
        {shown.map((r) => (
          <li key={r.key} className={styles.row}>
            <span className={`${styles.avatar} ${styles[r.status]}`} aria-hidden="true">
              {initials(r.name)}
            </span>

            <div className={styles.who}>
              <p className={styles.name}>{r.name}</p>
              <p className={styles.meta}>
                {r.shared ? "Shared link" : `${r.seats} ${r.seats === 1 ? "seat" : "seats"}`}
                {r.repliedOn && ` · ${r.repliedOn}`}
                {r.message && (
                  <span className={styles.hasNote} title={r.message}>
                    {" "}
                    · note
                  </span>
                )}
              </p>
            </div>

            <span className={`${styles.status} ${styles[r.status]}`}>
              {r.status === "yes" ? `${r.count} coming` : r.status === "no" ? "Declined" : "Waiting"}
            </span>

            <div className={styles.actions}>
              {r.link && (
                <>
                  <a href={r.link} target="_blank" rel="noopener" aria-label={`Open ${r.name}'s invitation`} title="Open invitation">
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M9 3h4v4M13 3L7.5 8.5M11 9.5V13H3V5h3.5" />
                    </svg>
                  </a>
                  <button
                    type="button"
                    onClick={() => copy(r)}
                    aria-label={`Copy ${r.name}'s link`}
                    title={copied === r.key ? "Copied" : "Copy link"}
                  >
                    {copied === r.key ? (
                      <svg viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M3 8.5l3 3 7-7" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 16 16" aria-hidden="true">
                        <rect x="5" y="5" width="8" height="8" rx="1.5" />
                        <path d="M3 10.5V4a1 1 0 0 1 1-1h6.5" />
                      </svg>
                    )}
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
        {shown.length === 0 && <li className={styles.empty}>No guest matches.</li>}
      </ul>
    </section>
  );
}
