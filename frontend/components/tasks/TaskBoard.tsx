"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Pagination from "@mui/material/Pagination";
import Snackbar from "@mui/material/Snackbar";
import {
  ApiError,
  TASKS_PER_PAGE,
  tasksApi,
  type Filter,
  type Task,
  type TaskStatus,
} from "@/lib/api";
import NewTaskForm from "./NewTaskForm";
import TaskFilter from "./TaskFilter";
import TaskItem from "./TaskItem";
import styles from "./tasks.module.css";

export default function TaskBoard() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [counts, setCounts] = useState({ total: 0, all: 0, done: 0 });
  const [reloadKey, setReloadKey] = useState(0);
  const lastLoaded = useRef<{ page: number; filter: Filter }>({ page: 1, filter: "all" });
  const [openId, setOpenId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function showError(e: unknown) {
    if (e instanceof ApiError && e.status === 401) {
      router.replace("/login");
      return;
    }
    setError(e instanceof Error ? e.message : "Something went wrong.");
  }

  useEffect(() => {
    let cancelled = false;
    tasksApi
      .list({ pageNum: page, filter })
      .then((result) => {
        if (cancelled) return;
        if (result.tasks.length === 0 && page > 1) {
          const lastPage = Math.max(1, Math.ceil(result.totalCount / TASKS_PER_PAGE));
          if (lastPage < page) {
            setPage(lastPage);
            return;
          }
        }
        lastLoaded.current = { page, filter };
        setTasks(result.tasks);
        setCounts({ total: result.totalCount, all: result.allCount, done: result.doneCount });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setTasks((prev) => prev ?? []);
        // Roll the selection back to what is actually on screen.
        setPage(lastLoaded.current.page);
        setFilter(lastLoaded.current.filter);
        showError(e);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter, reloadKey]);

  function changeFilter(f: Filter) {
    setFilter(f);
    setPage(1);
  }

  const replaceTask = (updated: Task) =>
    setTasks((prev) => prev?.map((t) => (t.id === updated.id ? updated : t)) ?? prev);

  // Optimistic update with rollback on failure.
  async function updateTask(task: Task, patch: Partial<Pick<Task, "status" | "note">>) {
    const delta =
      patch.status === undefined
        ? 0
        : Number(patch.status === "done") - Number(task.status === "done");
    const adjustDone = (d: number) => setCounts((c) => ({ ...c, done: c.done + d }));
    replaceTask({ ...task, ...patch });
    adjustDone(delta);
    try {
      replaceTask(await tasksApi.update(task.id, patch));
    } catch (e) {
      replaceTask(task);
      adjustDone(-delta);
      showError(e);
    }
  }

  async function addTask(title: string) {
    try {
      const task = await tasksApi.create(title);
      if (filter === "done") setFilter("all");
      setPage(1);
      setReloadKey((k) => k + 1);
      setOpenId(task.id);
      return true;
    } catch (e) {
      showError(e);
      return false;
    }
  }

  async function deleteTask(task: Task) {
    const previous = tasks;
    setTasks((prev) => prev?.filter((t) => t.id !== task.id) ?? prev);
    setOpenId(null);
    try {
      await tasksApi.remove(task.id);
      setReloadKey((k) => k + 1);
    } catch (e) {
      setTasks(previous);
      showError(e);
    }
  }

  const pageCount = Math.ceil(counts.total / TASKS_PER_PAGE);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.heading}>
            <h1 className={styles.title}>Today</h1>
            <p className={styles.summary}>
              {tasks === null ? "Loading…" : `${counts.done} of ${counts.all} done`}
            </p>
          </div>
          <TaskFilter value={filter} onChange={changeFilter} />
        </header>

        <NewTaskForm onAdd={addTask} />

        {tasks !== null && (
          <>
            <ul className={styles.list}>
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  open={openId === task.id}
                  onToggleDone={() =>
                    updateTask(task, {
                      status: (task.status === "done" ? "pending" : "done") as TaskStatus,
                    })
                  }
                  onToggleOpen={() => setOpenId(openId === task.id ? null : task.id)}
                  onSaveNote={(note) => updateTask(task, { note })}
                  onDelete={() => deleteTask(task)}
                />
              ))}
            </ul>

            {pageCount > 1 && (
              <div className={styles.pagination}>
                <Pagination count={pageCount} page={page} onChange={(_, p) => setPage(p)} />
              </div>
            )}

            {tasks.length === 0 && (
              <p className={styles.empty}>
                {filter === "done" ? "Nothing completed yet." : "All clear. Add a task above."}
              </p>
            )}
          </>
        )}
      </main>

      <Snackbar
        open={error !== null}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
}
