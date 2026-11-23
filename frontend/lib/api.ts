import { API_URL, clearSession, getToken } from "@/lib/auth";

export type Filter = "all" | "open" | "done";

export type TaskStatus = "pending" | "in_progress" | "done";

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export const TASKS_PER_PAGE = 10;

export interface TaskPage {
  tasks: Task[];
  totalCount: number;
  allCount: number;
  doneCount: number;
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function send(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (response.status === 401) {
    // Token expired or revoked: drop the session; callers redirect to /login.
    clearSession();
    throw new ApiError("Your session has expired.", 401);
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message =
      data.error ??
      (data.errors
        ? Object.entries(data.errors as Record<string, string[]>)
            .map(([field, msgs]) => `${field} ${msgs.join(", ")}`)
            .join("; ")
        : `Request failed (${response.status})`);
    throw new ApiError(message, response.status);
  }

  return response;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await send(path, init);
  return response.status === 204 ? (undefined as T) : response.json();
}

const countHeader = (response: Response, name: string) =>
  Number(response.headers.get(name)) || 0;

export const tasksApi = {
  list: async ({ pageNum, filter }: { pageNum: number; filter: Filter }): Promise<TaskPage> => {
    const response = await send(`/tasks?page_num=${pageNum}&filter=${filter}`);
    return {
      tasks: await response.json(),
      totalCount: countHeader(response, "X-Total-Count"),
      allCount: countHeader(response, "X-All-Count"),
      doneCount: countHeader(response, "X-Done-Count"),
    };
  },
  create: (title: string) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify({ task: { title } }) }),
  update: (id: number, task: Partial<Pick<Task, "title" | "status" | "note">>) =>
    request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ task }) }),
  remove: (id: number) => request<void>(`/tasks/${id}`, { method: "DELETE" }),
};
