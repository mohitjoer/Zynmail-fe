import type {
  EmailListResponse,
  EmailThreadResponse,
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

    getThread: (idOrThreadId: string) =>
      fetchAPI<EmailThreadResponse>(`/api/emails/${idOrThreadId}/thread`),

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
    get: () => fetchAPI<UserProfile>("/api/user/me"),
    update: (data: { name?: string; signature?: string }) =>
      fetchAPI<{ status: string; message: string }>("/api/user/me", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
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
      fetchAPI<{ message: string; simulation?: any }>(`/api/automations/${id}/test`, {
        method: "POST",
      }),
    simulate: (data: {
      rule_id?: string;
      rule_data?: any;
      email_id?: string;
      custom_email?: any;
      live_execute?: boolean;
    }) =>
      fetchAPI<{
        matched: boolean;
        reason: string;
        action_type: string;
        steps: Array<{ id: string; name: string; status: string; detail: string }>;
        output_preview: string;
        executed: boolean;
        tested_email?: { id: string; subject: string; sender: string; sender_name: string };
      }>("/api/automations/simulate", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    runInbox: (id: string, limit: number = 20) =>
      fetchAPI<{
        rule_name: string;
        total_scanned: number;
        matched_count: number;
        results: Array<{ email_id: string; subject: string; sender: string; action_type: string; output: string }>;
      }>(`/api/automations/${id}/run-inbox`, {
        method: "POST",
        body: JSON.stringify({ limit }),
      }),
  },

  auth: {
    status: () =>
      fetchAPI<{
        authenticated: boolean;
        connected: boolean;
        gmail_connected: boolean;
        gmail_email?: string;
        gmail_scopes?: string[];
        user?: any;
      }>("/api/auth/status"),
    signin: (data: { email: string; password: string }) =>
      fetchAPI<{ status: string; message: string; user: UserProfile; token?: string }>("/api/auth/signin", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    signup: (data: { email: string; password: string }) =>
      fetchAPI<{ status: string; message: string; user: UserProfile; token?: string }>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    logout: () => fetchAPI<{ status: string; message: string }>("/api/auth/logout", { method: "POST" }),
    disconnectGmail: () => fetchAPI<{ status: string; message: string }>("/api/auth/gmail/disconnect", { method: "POST" }),
    getGoogleUrl: () => fetchAPI<{ url: string }>("/api/auth/google/url"),
    googleCallback: (code: string) =>
      fetchAPI<{ status: string; message: string }>("/api/auth/google/callback", {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
  },

  security: {
    status: () =>
      fetchAPI<{
        status: string;
        encryption_enabled: boolean;
        algorithm: string;
        key_status: string;
        data_at_rest: {
          status: string;
          field_level_encryption: string[];
          total_emails: number;
          encrypted_emails: number;
          coverage: string;
        };
        token_security: {
          oauth_tokens_encrypted: boolean;
          user_session_encrypted: boolean;
          file_permissions: string;
        };
        ai_safety: {
          prompt_injection_guard: boolean;
          xml_boundary_isolation: boolean;
          zero_width_filtering: boolean;
          zero_model_training: boolean;
        };
      }>("/api/security/status"),
    encryptExisting: () =>
      fetchAPI<{
        status: string;
        total_scanned: number;
        newly_encrypted: number;
        message: string;
      }>("/api/security/encrypt-existing", { method: "POST" }),
  },
};
