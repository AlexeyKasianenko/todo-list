"use client";

import { useState, type FormEvent } from "react";
import styles from "./tasks.module.css";

export default function NewTaskForm({
  onAdd,
}: {
  onAdd: (title: string) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draft.trim();
    if (!title || pending) return;

    setPending(true);
    const ok = await onAdd(title);
    setPending(false);
    if (ok) setDraft("");
  }

  return (
    <form method="post" onSubmit={handleSubmit} className={styles.form}>
      <label htmlFor="new-task" className={styles.visuallyHidden}>
        New task
      </label>
      <input
        id="new-task"
        type="text"
        placeholder="Add a task"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        autoComplete="off"
        maxLength={255}
        className={styles.input}
      />
      <button type="submit" disabled={pending} className={styles.addButton}>
        Add
      </button>
    </form>
  );
}
