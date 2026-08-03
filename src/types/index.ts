export interface EmailContact {
  name: string;
  email: string;
}

export interface Attachment {
  filename: string;
  size: number;
  mime_type: string;
  attachment_id?: string;
}

export interface Email {
  id: string;
  from_contact: EmailContact;
  to: EmailContact[];
  cc: EmailContact[];
  subject: string;
  body: string;
  body_html: string;
  snippet: string;
  folder: string;
  labels: string[];
  is_read: boolean;
  is_starred: boolean;
  has_attachments: boolean;
  attachments: Attachment[];
  thread_id: string | null;
  unsubscribe_link?: string;
  ai_category?: string;
  timestamp: string;
}

export interface EmailListResponse {
  emails: Email[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

export interface EmailCreate {
  to: EmailContact[];
  cc: EmailContact[];
  bcc: EmailContact[];
  subject: string;
  body: string;
  body_html: string;
  is_draft: boolean;
}

export interface EmailUpdate {
  is_read?: boolean;
  is_starred?: boolean;
  folder?: string;
  labels?: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  signature: string;
}

export interface FolderCounts {
  inbox?: number;
  sent?: number;
  drafts?: number;
  trash?: number;
  starred?: number;
  inbox_unread?: number;
  [key: string]: number | undefined;
}

export type ThemeMode = "light" | "dark";

export type MailFolder =
  | "inbox"
  | "starred"
  | "sent"
  | "drafts"
  | "trash";

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  trigger_type: "ai_condition" | "sender" | "category" | "keyword";
  trigger_value: string;
  action_type: "reply" | "forward" | "star" | "tag" | "archive";
  use_ai_reply: boolean;
  reply_prompt?: string;
  reply_template?: string;
  forward_to?: string;
  forward_note?: string;
  tag_name?: string;
  is_active: boolean;
  execution_count: number;
  last_executed_at?: string | null;
  created_at: string;
}

export interface AutomationRuleCreate {
  name: string;
  description?: string;
  trigger_type: "ai_condition" | "sender" | "category" | "keyword";
  trigger_value: string;
  action_type: "reply" | "forward" | "star" | "tag" | "archive";
  use_ai_reply?: boolean;
  reply_prompt?: string;
  reply_template?: string;
  forward_to?: string;
  forward_note?: string;
  tag_name?: string;
  is_active?: boolean;
}

export interface AutomationLog {
  id: string;
  rule_id: string;
  rule_name: string;
  email_id: string;
  email_subject: string;
  email_sender: string;
  action_executed: string;
  details?: string;
  timestamp: string;
}
