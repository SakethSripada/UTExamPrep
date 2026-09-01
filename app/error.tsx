"use client";

import { RotateCcw } from "lucide-react";

export default function ErrorPage({ unstable_retry }: { unstable_retry: () => void }) {
  return (
    <main className="friendly-error" role="alert">
      <p className="eyebrow">UTExamPrep</p>
      <h1>That page did not load correctly.</h1>
      <p>Your saved exam progress is still in this browser. Try loading the page again.</p>
      <button className="primary-button" onClick={unstable_retry}>
        <RotateCcw size={17} />
        Try again
      </button>
    </main>
  );
}
