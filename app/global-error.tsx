"use client";

export default function GlobalError({ unstable_retry }: { unstable_retry: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="friendly-error" role="alert">
          <p>UTExamPrep</p>
          <h1>Something interrupted this page.</h1>
          <p>Your work is saved locally. Reload the app to keep studying.</p>
          <button onClick={unstable_retry}>Reload UTExamPrep</button>
        </main>
      </body>
    </html>
  );
}
