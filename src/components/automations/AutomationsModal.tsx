"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Play,
  CheckCircle2,
  X,
  ArrowRight,
  Mail,
  Send,
  CornerUpRight,
  Star,
  Tag,
  Clock,
  AlertCircle,
  Loader2,
  Sliders,
  History,
  Check,
  Search
} from "lucide-react";
import { api } from "@/lib/api";
import { AutomationRule, AutomationRuleCreate, AutomationLog } from "@/types";

interface AutomationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AutomationsModal: React.FC<AutomationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [activeTab, setActiveTab] = useState<"rules" | "logs">("rules");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [testingRuleId, setTestingRuleId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; message: string } | null>(null);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AutomationRuleCreate>({
    name: "",
    description: "",
    trigger_type: "ai_condition",
    trigger_value: "",
    action_type: "reply",
    use_ai_reply: true,
    reply_prompt: "Politely thank them for reaching out and let them know we received their message.",
    reply_template: "",
    forward_to: "",
    forward_note: "Auto-forwarded by Zynmail AI Automation.",
    tag_name: "",
    is_active: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesData, logsData] = await Promise.all([
        api.automations.list().catch(() => []),
        api.automations.logs().catch(() => []),
      ]);
      setRules(rulesData);
      setLogs(logsData);
    } catch (err) {
      console.error("Failed to load automations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleGenerateFromAI = async (promptToUse?: string) => {
    const prompt = promptToUse || aiPrompt;
    if (!prompt.trim()) return;

    try {
      setGenerating(true);
      const generated = await api.automations.generate(prompt);
      
      setFormData({
        name: generated.name || "Custom AI Workflow",
        description: generated.description || prompt,
        trigger_type: (generated.trigger_type as any) || "ai_condition",
        trigger_value: generated.trigger_value || prompt,
        action_type: (generated.action_type as any) || "reply",
        use_ai_reply: generated.use_ai_reply ?? true,
        reply_prompt: generated.reply_prompt || "Politely acknowledge and respond to this email.",
        reply_template: generated.reply_template || "",
        forward_to: generated.forward_to || "",
        forward_note: generated.forward_note || "Auto-forwarded by Zynmail AI.",
        tag_name: generated.tag_name || "",
        is_active: true,
      });

      setEditingRuleId(null);
      setIsEditorOpen(true);
    } catch (err) {
      console.error("AI Generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleActive = async (rule: AutomationRule) => {
    try {
      const updated = await api.automations.update(rule.id, {
        is_active: !rule.is_active,
      });
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, is_active: updated.is_active } : r))
      );
    } catch (err) {
      console.error("Failed to toggle rule:", err);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this automation workflow?")) return;
    try {
      await api.automations.delete(ruleId);
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
    } catch (err) {
      console.error("Failed to delete rule:", err);
    }
  };

  const handleTestRule = async (ruleId: string) => {
    try {
      setTestingRuleId(ruleId);
      setTestResult(null);
      const res = await api.automations.test(ruleId);
      setTestResult({ id: ruleId, message: res.message || "Rule tested successfully!" });
      loadData();
    } catch (err: any) {
      setTestResult({ id: ruleId, message: err.message || "Test execution finished." });
    } finally {
      setTestingRuleId(null);
    }
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRuleId) {
        const updated = await api.automations.update(editingRuleId, formData);
        setRules((prev) =>
          prev.map((r) => (r.id === editingRuleId ? updated : r))
        );
      } else {
        const created = await api.automations.create(formData);
        setRules((prev) => [created, ...prev]);
      }
      setIsEditorOpen(false);
      setEditingRuleId(null);
    } catch (err) {
      console.error("Failed to save rule:", err);
    }
  };

  const openNewRuleEditor = () => {
    setEditingRuleId(null);
    setFormData({
      name: "",
      description: "",
      trigger_type: "ai_condition",
      trigger_value: "",
      action_type: "reply",
      use_ai_reply: true,
      reply_prompt: "Politely thank them and let them know we received their email.",
      reply_template: "",
      forward_to: "",
      forward_note: "Auto-forwarded by Zynmail AI Automation.",
      tag_name: "",
      is_active: true,
    });
    setIsEditorOpen(true);
  };

  const openEditRuleEditor = (rule: AutomationRule) => {
    setEditingRuleId(rule.id);
    setFormData({
      name: rule.name,
      description: rule.description || "",
      trigger_type: rule.trigger_type,
      trigger_value: rule.trigger_value,
      action_type: rule.action_type,
      use_ai_reply: rule.use_ai_reply,
      reply_prompt: rule.reply_prompt || "",
      reply_template: rule.reply_template || "",
      forward_to: rule.forward_to || "",
      forward_note: rule.forward_note || "",
      tag_name: rule.tag_name || "",
      is_active: rule.is_active,
    });
    setIsEditorOpen(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Main Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-background/95 border border-border/80 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
              <Zap className="h-5 w-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  AI Automations & Workflows
                </h2>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  Autonomous
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Trigger intelligent auto-replies, forwarding, tagging, and organization when emails arrive.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openNewRuleEditor}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg shadow hover:bg-primary/90 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              New Workflow
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* AI Prompt Generator Banner */}
        <div className="p-5 border-b border-border/60 bg-gradient-to-r from-orange-500/5 via-amber-500/5 to-purple-500/5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-medium text-foreground">
              Create a workflow with AI natural language:
            </span>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerateFromAI()}
                placeholder="e.g., If anyone emails asking for pricing, auto-reply with our rate card and forward to team@zynmail.com"
                className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/40 shadow-inner"
              />
            </div>
            <button
              onClick={() => handleGenerateFromAI()}
              disabled={generating || !aiPrompt.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl shadow-md hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 transition"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate
                </>
              )}
            </button>
          </div>

          {/* Quick Preset Chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="text-[11px] text-muted-foreground mr-1">Try:</span>
            {[
              "Auto-forward invoices & receipts to accounting@zynmail.com",
              "If someone asks for a demo or meeting, auto-reply with my Calendly link",
              "Star and prioritize any urgent messages from clients",
              "Auto-tag and organize newsletters into Noise",
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAiPrompt(chip);
                  handleGenerateFromAI(chip);
                }}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-background/80 hover:bg-muted border border-border/60 text-muted-foreground hover:text-foreground transition"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-border/60">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("rules")}
              className={`pb-2.5 text-xs font-medium border-b-2 transition flex items-center gap-1.5 ${
                activeTab === "rules"
                  ? "border-orange-500 text-orange-600 dark:text-orange-400 font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              Workflows ({rules.length})
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`pb-2.5 text-xs font-medium border-b-2 transition flex items-center gap-1.5 ${
                activeTab === "logs"
                  ? "border-orange-500 text-orange-600 dark:text-orange-400 font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <History className="h-3.5 w-3.5" />
              Execution Logs ({logs.length})
            </button>
          </div>

          <div className="pb-2 text-[11px] text-muted-foreground">
            {rules.filter((r) => r.is_active).length} active workflow(s)
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-2" />
              <p className="text-xs">Loading automations...</p>
            </div>
          ) : activeTab === "rules" ? (
            rules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-3">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-medium text-foreground">No automations configured</h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  Use the AI generator prompt above or click &ldquo;New Workflow&rdquo; to set up your first autonomous email rule.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-xl border transition-all ${
                      rule.is_active
                        ? "bg-card/70 border-border/80 shadow-sm hover:border-orange-500/40"
                        : "bg-muted/30 border-border/40 opacity-70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              rule.is_active ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : "bg-muted-foreground/40"
                            }`}
                          />
                          <h4 className="text-sm font-semibold text-foreground">
                            {rule.name}
                          </h4>
                          {rule.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              — {rule.description}
                            </span>
                          )}
                        </div>

                        {/* Flow visual */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                          {/* Trigger Pill */}
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium">
                            <Sparkles className="h-3 w-3" />
                            <span>
                              {rule.trigger_type === "ai_condition" && "AI Criteria: "}
                              {rule.trigger_type === "sender" && "From Sender: "}
                              {rule.trigger_type === "category" && "Category: "}
                              {rule.trigger_type === "keyword" && "Keyword: "}
                              &ldquo;{rule.trigger_value}&rdquo;
                            </span>
                          </div>

                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />

                          {/* Action Pill */}
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                            {rule.action_type === "reply" && <Send className="h-3 w-3" />}
                            {rule.action_type === "forward" && <CornerUpRight className="h-3 w-3" />}
                            {rule.action_type === "star" && <Star className="h-3 w-3 fill-emerald-500/30" />}
                            {rule.action_type === "tag" && <Tag className="h-3 w-3" />}
                            <span>
                              {rule.action_type === "reply" && (rule.use_ai_reply ? "AI Auto-Reply" : "Template Reply")}
                              {rule.action_type === "forward" && `Forward to ${rule.forward_to || "recipient"}`}
                              {rule.action_type === "star" && "Star & Prioritize"}
                              {rule.action_type === "tag" && `Tag as ${rule.tag_name || "Custom"}`}
                              {rule.action_type === "archive" && "Archive"}
                            </span>
                          </div>
                        </div>

                        {/* Stats & Details */}
                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-orange-500" />
                            Triggered {rule.execution_count} time(s)
                          </span>
                          {rule.last_executed_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last run {new Date(rule.last_executed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>

                        {/* Test Feedback Message */}
                        {testResult?.id === rule.id && (
                          <div className="mt-2 text-xs p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            <span>{testResult.message}</span>
                          </div>
                        )}
                      </div>

                      {/* Right controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Toggle active */}
                        <button
                          onClick={() => handleToggleActive(rule)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            rule.is_active ? "bg-orange-500" : "bg-muted"
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              rule.is_active ? "translate-x-4" : "translate-x-1"
                            }`}
                          />
                        </button>

                        {/* Test action */}
                        <button
                          onClick={() => handleTestRule(rule.id)}
                          disabled={testingRuleId === rule.id}
                          title="Test on latest inbox email"
                          className="p-1.5 text-muted-foreground hover:text-emerald-500 rounded-lg hover:bg-muted transition"
                        >
                          {testingRuleId === rule.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEditRuleEditor(rule)}
                          title="Edit workflow"
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          title="Delete workflow"
                          className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-muted transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Logs Tab */
            logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <History className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-xs">No execution history recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl border border-border/60 bg-card/50 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{log.rule_name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground">
                          {log.action_executed}
                        </span>
                      </div>
                      <p className="text-muted-foreground">
                        Matched email &ldquo;<span className="text-foreground">{log.email_subject}</span>&rdquo; from {log.email_sender}
                      </p>
                      {log.details && (
                        <p className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                          ⚡ {log.details}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(log.timestamp).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Workflow Engine is actively listening for incoming emails</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-border/60 hover:bg-muted text-foreground transition"
          >
            Done
          </button>
        </div>
      </div>

      {/* Slideover / Editor Modal for Creating or Editing Rule */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-semibold text-foreground">
                {editingRuleId ? "Edit Automation Rule" : "Create New Workflow"}
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Forward Pricing Inquiries"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Trigger Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Trigger Condition
                  </label>
                  <select
                    value={formData.trigger_type}
                    onChange={(e) =>
                      setFormData({ ...formData, trigger_type: e.target.value as any })
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="ai_condition">🤖 AI Condition (Smart Natural Language)</option>
                    <option value="sender">📧 Sender Email or Domain</option>
                    <option value="keyword">🔍 Keyword (Subject / Body)</option>
                    <option value="category">🏷️ Category (Needs Reply, VIP, etc.)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Action Type
                  </label>
                  <select
                    value={formData.action_type}
                    onChange={(e) =>
                      setFormData({ ...formData, action_type: e.target.value as any })
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="reply">✉️ Auto-Reply</option>
                    <option value="forward">↗️ Auto-Forward</option>
                    <option value="star">⭐ Star & Prioritize</option>
                    <option value="tag">🏷️ Apply Custom Tag</option>
                    <option value="archive">📥 Move to Archive</option>
                  </select>
                </div>
              </div>

              {/* Trigger Value Input */}
              <div>
                <label className="block font-medium text-foreground mb-1">
                  {formData.trigger_type === "ai_condition" && "Describe what kind of email triggers this (AI evaluates this):"}
                  {formData.trigger_type === "sender" && "Sender email or domain (e.g. boss@company.com or billing@):"}
                  {formData.trigger_type === "keyword" && "Keyword to match (e.g. Invoice, Receipt, Proposal):"}
                  {formData.trigger_type === "category" && "Category name (Needs Reply, VIP, Linear, Noise):"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.trigger_value}
                  onChange={(e) =>
                    setFormData({ ...formData, trigger_value: e.target.value })
                  }
                  placeholder="e.g. Customer asking for a demo or quote"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Action specific fields */}
              {formData.action_type === "reply" && (
                <div className="space-y-3 p-3 rounded-xl bg-muted/30 border border-border/60">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">Draft reply with AI</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, use_ai_reply: !formData.use_ai_reply })
                      }
                      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                        formData.use_ai_reply ? "bg-orange-500" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          formData.use_ai_reply ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  {formData.use_ai_reply ? (
                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">
                        Instructions for AI reply:
                      </label>
                      <textarea
                        rows={2}
                        value={formData.reply_prompt}
                        onChange={(e) =>
                          setFormData({ ...formData, reply_prompt: e.target.value })
                        }
                        placeholder="e.g. Thank them politely and give them our meeting link (calendly.com/zynmail)"
                        className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">
                        Static Reply Template:
                      </label>
                      <textarea
                        rows={2}
                        value={formData.reply_template}
                        onChange={(e) =>
                          setFormData({ ...formData, reply_template: e.target.value })
                        }
                        placeholder="Thank you for reaching out. We have received your email."
                        className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {formData.action_type === "forward" && (
                <div className="space-y-2 p-3 rounded-xl bg-muted/30 border border-border/60">
                  <div>
                    <label className="block font-medium text-foreground mb-1">
                      Forward To Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.forward_to}
                      onChange={(e) =>
                        setFormData({ ...formData, forward_to: e.target.value })
                      }
                      placeholder="e.g. team@yourcompany.com"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">
                      Forwarding Note (prepended to message)
                    </label>
                    <input
                      type="text"
                      value={formData.forward_note}
                      onChange={(e) =>
                        setFormData({ ...formData, forward_note: e.target.value })
                      }
                      placeholder="Auto-forwarded by Zynmail AI Automation."
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>
              )}

              {formData.action_type === "tag" && (
                <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                  <label className="block font-medium text-foreground mb-1">
                    Tag / Label Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tag_name}
                    onChange={(e) =>
                      setFormData({ ...formData, tag_name: e.target.value })
                    }
                    placeholder="e.g. Needs Follow-up, Invoices, Leads"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 shadow-md transition"
                >
                  {editingRuleId ? "Save Changes" : "Create Workflow"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
