"use client";

import { useState } from "react";
import type { Task } from "@/lib/api";
import styles from "./tasks.module.css";

interface TaskItemProps {
  task: Task;
  open: boolean;
  onToggleDone: () => void;
  onToggleOpen: () => void;
  onSaveNote: (note: string) => void;
  onDelete: () => void;
}

export default function TaskItem({
  task,
  open,
  onToggleDone,
  onToggleOpen,
  onSaveNote,
  onDelete,
}: TaskItemProps) {
  const done = task.status === "done";
  const savedNote = task.note ?? "";
  const [note, setNote] = useState(savedNote);
  const hasNote = note.trim().length > 0;
  const noteId = `note-${task.id}`;

  return (
    <li className={styles.card} data-open={open}>
      <div className={styles.row}>
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-label={`${done ? "Mark as not done" : "Mark as done"}: ${task.title}`}
          onClick={onToggleDone}
          className={styles.checkButton}
        >
          <span className={styles.checkbox} data-checked={done}>
            {done && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2.5 7.5l3 3 6-7" />
              </svg>
            )}
          </span>
        </button>

        <button
          type="button"
          aria-expanded={open}
          aria-controls={open ? `${noteId}-panel` : undefined}
          onClick={onToggleOpen}
          className={styles.expandButton}
        >
          <span className={styles.taskTitle} data-done={done}>
            {task.title}
          </span>
          {hasNote && (
            <span className={styles.noteBadge}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 2.5h8M3 5.5h8M3 8.5h5" />
              </svg>
              Note
            </span>
          )}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={styles.chevron} data-open={open}>
            <path d="M4 6l4 4 4-4" />
          </svg>
        </button>
      </div>

      {open && (
        <div id={`${noteId}-panel`} className={styles.details}>
          <label htmlFor={noteId} className={styles.notesLabel}>
            Notes
          </label>
          <textarea
            id={noteId}
            rows={3}
            placeholder="Add details, links or next steps"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={(e) => {
              const value = e.currentTarget.value;
              if (value !== savedNote) onSaveNote(value);
            }}
            className={styles.textarea}
          />
          <div className={styles.detailsFooter}>
            <button type="button" onClick={onDelete} className={styles.deleteButton}>
              Delete task
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
