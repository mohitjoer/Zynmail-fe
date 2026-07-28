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
