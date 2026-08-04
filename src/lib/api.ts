import type {
  EmailListResponse,
  Email,
  EmailCreate,
  EmailUpdate,
  FolderCounts,
  UserProfile,
  AutomationRule,
  AutomationRuleCreate,
  AutomationLog,
} from "@/types";

const API_BASE = "";

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const isGet = !options.method || options.method.toUpperCase() === "GET";
  const url = isGet 
    ? `${API_BASE}${endpoint}${endpoint.includes("?") ? "&" : "?"}_t=${Date.now()}`
    : `${API_BASE}${endpoint}`;
    
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `API Error: ${res.status}`);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export const api = {
  emails: {
    list: (params?: {
      folder?: string;
      search?: string;
      page?: number;
      per_page?: number;
    }) => {
      const query = new URLSearchParams();
      if (params?.folder) query.set("folder", params.folder);
      if (params?.search) query.set("search", params.search);
      if (params?.page) query.set("page", String(params.page));
      if (params?.per_page) query.set("per_page", String(params.per_page));
      const qs = query.toString();
      return fetchAPI<EmailListResponse>(
        `/api/emails${qs ? `?${qs}` : ""}`
      );
    },

    get: (id: string) => fetchAPI<Email>(`/api/emails/${id}`),

    create: (data: EmailCreate) =>
      fetchAPI<Email>("/api/emails", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: EmailUpdate) =>
      fetchAPI<Email>(`/api/emails/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchAPI<void>(`/api/emails/${id}`, { method: "DELETE" }),

    counts: () => fetchAPI<FolderCounts>("/api/emails/counts"),

    sync: () => fetchAPI<{ status: string; message?: string; synced?: number }>("/api/emails/sync", { method: "POST" }),
  },

  user: {
    me: () => fetchAPI<UserProfile>("/api/user/me"),
  },

  automations: {
    list: () => fetchAPI<AutomationRule[]>("/api/automations"),
    create: (data: AutomationRuleCreate) =>
      fetchAPI<AutomationRule>("/api/automations", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    generate: (prompt: string) =>
      fetchAPI<Partial<AutomationRuleCreate>>("/api/automations/generate", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      }),
    chatBuild: (data: { message: string; current_workflow?: any; graph_nodes?: any[]; graph_edges?: any[]; history?: any[] }) =>
      fetchAPI<{ message: string; workflow?: any; graph_nodes: any[]; graph_edges: any[]; suggested_actions: string[]; needs_clarification: boolean }>("/api/automations/chat-build", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<AutomationRuleCreate>) =>
      fetchAPI<AutomationRule>(`/api/automations/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchAPI<{ message: string }>(`/api/automations/${id}`, {
        method: "DELETE",
      }),
    logs: () => fetchAPI<AutomationLog[]>("/api/automations/logs"),
    test: (id: string) =>
      fetchAPI<{ message: string }>(`/api/automations/${id}/test`, {
        method: "POST",
      }),
  },
};
