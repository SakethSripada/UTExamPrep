"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

function formatTime(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Accepts "25" (minutes), "5:30" or "5:3" (minutes:seconds). Returns total seconds.
function parseTime(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    return 0;
  }
  const parts = trimmed.split(":");
  if (parts.length === 1) {
    const minutes = parseInt(parts[0], 10);
    return Number.isNaN(minutes) ? 0 : Math.max(0, minutes) * 60;
  }
  const minutes = parseInt(parts[0], 10) || 0;
  const seconds = parseInt(parts[1], 10) || 0;
  return Math.max(0, minutes) * 60 + Math.min(59, Math.max(0, seconds));
}

export function ExamTimer({ defaultMinutes = 0 }: { defaultMinutes?: number }) {
  const defaultSeconds = Math.max(0, defaultMinutes) * 60;
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const [expired, setExpired] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!running) {
      return;
    }
    const id = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setRunning(false);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  function addMinutes(minutes: number) {
    setExpired(false);
    setRemaining((prev) => prev + minutes * 60);
  }

  function toggleRunning() {
    if (remaining <= 0) {
      return;
    }
    setExpired(false);
    setRunning((prev) => !prev);
  }

  function reset() {
    setRunning(false);
    setExpired(false);
    setRemaining(defaultSeconds);
  }

  function commitDraft() {
    setRemaining(parseTime(draft));
    setExpired(false);
    setEditing(false);
  }

  const idle = remaining <= 0 && !expired;
  const inputValue = editing ? draft : expired ? "Time's up" : formatTime(remaining);

  return (
    <div className={`exam-timer ${expired ? "expired" : ""} ${running ? "running" : ""}`}>
      <div className="timer-value">
        <input
          className="timer-input"
          style={{ width: `${Math.max(4, inputValue.length + 1)}ch` }}
          value={inputValue}
          onChange={(event) => setDraft(event.target.value)}
          onFocus={() => {
            if (running) {
              return;
            }
            setEditing(true);
            setDraft(formatTime(remaining));
          }}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
          }}
          readOnly={running}
          inputMode="numeric"
          aria-label="Timer, editable as minutes or minutes:seconds"
          placeholder="0:00"
        />
      </div>
      <div className="timer-controls">
        <button type="button" className="timer-chip" onClick={() => addMinutes(1)}>
          +1
        </button>
        <button type="button" className="timer-chip" onClick={() => addMinutes(5)}>
          +5
        </button>
        <button type="button" className="timer-chip" onClick={() => addMinutes(10)}>
          +10
        </button>
        <button
          type="button"
          className="timer-action"
          onClick={toggleRunning}
          disabled={remaining <= 0}
          aria-label={running ? "Pause timer" : "Start timer"}
        >
          {running ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <button
          type="button"
          className="timer-action"
          onClick={reset}
          disabled={idle}
          aria-label="Reset timer"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </div>
  );
}
