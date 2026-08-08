"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import {
  N8nWorkflowCanvas,
  WorkflowNode,
  WorkflowConnection,
} from "@/components/automations/N8nWorkflowCanvas";
import {
  Sparkles,
  Zap,
  Send,
  Plus,
  Play,
  RotateCcw,
  History,
  Terminal,
  Layers,
  Bot,
  User,
  ShieldCheck,
  Check,
  ChevronRight,
  AlertCircle,
  Copy,
  Trash2,
  X,
  SlidersHorizontal,
  Mail,
  Share2,
  Tag,
  Star,
  Archive,
  ArrowRight,
  Cpu,
  Database,
  Webhook,
  Activity,
  Edit3,
  Flame,
  CheckCircle2,
  FolderOpen,
  CornerDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { FormattedMessage } from "@/components/chat/FormattedMessage";
import type {
  AutomationRule,
  AutomationRuleCreate,
  AutomationLog,
  Email,
} from "@/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestedActions?: string[];
  workflowSnapshot?: any;
}

export default function AutomationsPage() {
  // Data State
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [recentEmails, setRecentEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Active Drawers / Modals
  const [showRulesDrawer, setShowRulesDrawer] = useState(false);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);
  const [showTestDrawer, setShowTestDrawer] = useState(false);

  // Simulation / Test State
  const [simulating, setSimulating] = useState(false);
  const [selectedTestEmailId, setSelectedTestEmailId] = useState<string>("latest");
  const [customTestSender, setCustomTestSender] = useState("invoices@stripe.com");
  const [customTestSubject, setCustomTestSubject] = useState("Your monthly invoice #1092");
  const [customTestBody, setCustomTestBody] = useState("Hi there, your Pro plan monthly subscription of $29.00 USD has been received. Thank you!");
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchResult, setBatchResult] = useState<any | null>(null);
  const [liveExecuteToggle, setLiveExecuteToggle] = useState(false);

  // Selected Node in Canvas for Inspector
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Active Workflow State (Compiled live via Chat)
  const [currentRuleId, setCurrentRuleId] = useState<string | null>(null);
  const [ruleName, setRuleName] = useState("New Workflow");
  const [ruleDescription, setRuleDescription] = useState(
    "Describe your workflow in the chat to get started"
  );
  const [isActive, setIsActive] = useState(true);

  // Dynamic workflow spec from AI (flat representation for save/deploy)
  const [workflowSpec, setWorkflowSpec] = useState<Record<string, any>>({});

  // Dynamic Graph State — populated by AI chat responses
  const [canvasWorkflowNodes, setCanvasWorkflowNodes] = useState<WorkflowNode[]>([
    {
      id: "node_trigger_mail",
      type: "trigger",
      title: "Incoming Mails",
      description: "All incoming emails — chat to build your flow",
      prompt: "Trigger: Intercept all incoming email events in real-time",
      icon: Mail,
      color: "emerald",
      badge: "Root Ingest",
      metrics: "Real-time",
      position: { x: 50, y: 170 },
    },
  ]);
  const [canvasWorkflowConnections, setCanvasWorkflowConnections] = useState<WorkflowConnection[]>([]);

  // Chat Interface State
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "bot-init",
      role: "assistant",
      content:
        "Hello! I am your **AI Workflow Architect**.\n\nDescribe any email automation workflow in natural language (e.g. *\"When an invoice arrives from Stripe, forward to accounting@company.com\"*), and I will design and connect your workflow live on the canvas.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggestedActions: [
        "Invoice & Receipt Router",
        "VIP Executive Escalation",
        "Support Auto-Responder",
      ],
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const alignNodesRef = useRef<(() => void) | null>(null);
  const addNodeRef = useRef<(() => void) | null>(null);

  // Load Automation Rules, Logs, and Emails on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesData, logsData, emailListRes] = await Promise.all([
        api.automations.list().catch(() => []),
        api.automations.logs().catch(() => []),
        api.emails.list({ per_page: 10 }).catch(() => ({ emails: [] })),
      ]);
      setRules(rulesData);
      setLogs(logsData);
      const emails = (emailListRes as any)?.emails || [];
      setRecentEmails(emails);
    } catch (err) {
      console.error("Failed to load automation data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  // Helper to update a selected node's properties live
  const updateSelectedNode = (updates: Partial<WorkflowNode>) => {
    if (!selectedNodeId) return;
    setCanvasWorkflowNodes((prev) =>
      prev.map((n) => (n.id === selectedNodeId ? { ...n, ...updates } : n))
    );
  };

  // Helper to remove a selected node (except root trigger)
  const deleteSelectedNode = () => {
    if (!selectedNodeId || selectedNodeId === "node_trigger_mail") {
      toast.error("The root Incoming Mails trigger node cannot be deleted.");
      return;
    }
    setCanvasWorkflowNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    setCanvasWorkflowConnections((prev) =>
      prev.filter((c) => c.from !== selectedNodeId && c.to !== selectedNodeId)
    );
    setSelectedNodeId(null);
    toast.success("Node removed from workflow");
  };

  // Icon resolver for dynamic nodes from the API
  const resolveIcon = (nodeType: string, title: string): React.ComponentType<{ className?: string }> => {
    const t = title.toLowerCase();
    if (t.includes("incoming") || t.includes("mail") || t.includes("email")) return Mail;
    if (t.includes("vip") || t.includes("priority") || t.includes("fast")) return Zap;
    if (t.includes("evaluator") || t.includes("decision") || t.includes("router") || t.includes("langgraph")) return Cpu;
    if (t.includes("reply") || t.includes("respond") || t.includes("send")) return Send;
    if (t.includes("forward") || t.includes("escalate") || t.includes("share")) return Share2;
    if (t.includes("star") || t.includes("flag")) return Star;
    if (t.includes("tag") || t.includes("label")) return Tag;
    if (t.includes("archive")) return Archive;
    if (t.includes("telemetry") || t.includes("log") || t.includes("audit") || t.includes("database")) return Database;
    if (t.includes("guard") || t.includes("safety") || t.includes("shield")) return ShieldCheck;
    if (nodeType === "trigger") return Mail;
    if (nodeType === "evaluator") return Cpu;
    if (nodeType === "action") return Zap;
    if (nodeType === "telemetry") return Database;
    return Webhook;
  };

  // Helper: Convert API graph_nodes to WorkflowNode[] with icons
  const apiNodesToCanvasNodes = (apiNodes: any[]): WorkflowNode[] => {
    return apiNodes.map((n) => ({
      id: n.id,
      type: n.type || "action",
      title: n.title || "Node",
      description: n.description || "",
      prompt: n.prompt || n.description || "",
      icon: resolveIcon(n.type || "action", n.title || ""),
      color: n.color || "blue",
      badge: n.badge,
      metrics: n.metrics,
      position: n.position || { x: 100, y: 100 },
    }));
  };

  // Current StateGraph JSON representation (dynamic, from graph state)
  const currentWorkflowState = {
    graph_id: currentRuleId || "draft_graph_01",
    name: ruleName,
    description: ruleDescription,
    version: "langgraph-v0.2",
    is_active: isActive,
    workflow: workflowSpec,
    nodes: canvasWorkflowNodes.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      description: n.description,
    })),
    edges: canvasWorkflowConnections.map((c) => [c.from, c.to]),
  };

  // Handle Chat Submission to LangGraph AI Architect
  const handleChatSubmit = async (customPrompt?: string) => {
    const text = customPrompt || chatInput.trim();
    if (!text || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      // Send current graph topology to the AI so it can build on top
      const res = await api.automations.chatBuild({
        message: text,
        current_workflow: workflowSpec,
        graph_nodes: canvasWorkflowNodes.map((n) => ({
          id: n.id, type: n.type, title: n.title, description: n.description,
          color: n.color, badge: n.badge, metrics: n.metrics, position: n.position,
        })),
        graph_edges: canvasWorkflowConnections.map((c) => ({ from: c.from, to: c.to })),
        history: messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
      });

      // Update workflow spec if returned
      if (res.workflow) {
        setWorkflowSpec(res.workflow);
        if (res.workflow.name) setRuleName(res.workflow.name);
        if (res.workflow.description) setRuleDescription(res.workflow.description);
      }

      // Update the visual graph — only if the AI returned new nodes (not a clarification)
      if (res.graph_nodes && res.graph_nodes.length > 0) {
        setCanvasWorkflowNodes(apiNodesToCanvasNodes(res.graph_nodes));
      }
      if (res.graph_edges && res.graph_edges.length > 0) {
        setCanvasWorkflowConnections(res.graph_edges);
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content:
          res.message ||
          "I have updated the workflow graph on the right to match your instructions.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedActions: res.suggested_actions || [
          "Save & Activate Flow",
          "Add more actions",
        ],
        workflowSnapshot: res.workflow,
      };

      setMessages((prev) => [...prev, botMsg]);

      if (!res.needs_clarification && res.graph_nodes && res.graph_nodes.length > 0) {
        toast.success("✨ Workflow nodes updated!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update workflow from chat");
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content:
            "I encountered an issue processing that instruction. Please try phrasing your request differently.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          suggestedActions: ["Build Invoice Router", "Build Support Auto-Responder"],
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Helper to compile the active canvas state into an AutomationRuleCreate payload
  const getWorkflowPayload = (): AutomationRuleCreate => {
    const triggerNode = canvasWorkflowNodes.find((n) => n.type === "trigger");
    const evaluatorNode = canvasWorkflowNodes.find((n) => n.type === "evaluator");
    const actionNodes = canvasWorkflowNodes.filter((n) => n.type === "action");
    const primaryAction = actionNodes[0];

    const resolvedName =
      (workflowSpec.name && workflowSpec.name !== "New Workflow" ? workflowSpec.name : null) ||
      (ruleName && ruleName !== "New Workflow" ? ruleName : null) ||
      (primaryAction ? `${primaryAction.title} Workflow` : "Custom Automation Workflow");

    const resolvedDescription =
      workflowSpec.description ||
      ruleDescription ||
      evaluatorNode?.prompt ||
      evaluatorNode?.description ||
      "Custom LangGraph email automation workflow";

    const resolvedTriggerValue =
      workflowSpec.trigger_value ||
      triggerNode?.prompt ||
      triggerNode?.description ||
      evaluatorNode?.prompt ||
      "All incoming emails";

    const isForward = canvasWorkflowNodes.some(
      (n) => n.id.includes("forward") || n.title.toLowerCase().includes("forward")
    );
    const isTag = canvasWorkflowNodes.some(
      (n) => n.id.includes("tag") || n.title.toLowerCase().includes("tag")
    );

    const resolvedActionType =
      workflowSpec.action_type ||
      (isForward ? "forward" : isTag ? "tag" : "reply");

    const resolvedReplyPrompt =
      workflowSpec.reply_prompt ||
      primaryAction?.prompt ||
      primaryAction?.description ||
      "Politely acknowledge receipt of the email.";

    return {
      name: resolvedName,
      description: resolvedDescription,
      trigger_type: workflowSpec.trigger_type || "ai_condition",
      trigger_value: resolvedTriggerValue,
      action_type: resolvedActionType,
      use_ai_reply: workflowSpec.use_ai_reply ?? true,
      reply_prompt: resolvedReplyPrompt,
      reply_template: workflowSpec.reply_template || "",
      forward_to: workflowSpec.forward_to || "",
      forward_note: workflowSpec.forward_note || "",
      tag_name: workflowSpec.tag_name || "",
      is_active: isActive,
      graph_nodes: canvasWorkflowNodes.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        description: n.description,
        prompt: n.prompt || n.description,
        color: n.color,
        badge: n.badge,
        metrics: n.metrics,
        position: n.position,
      })),
      graph_edges: canvasWorkflowConnections.map((c) => ({
        from: c.from,
        to: c.to,
      })),
    };
  };

  // Save / Deploy Workflow
  const handleSaveWorkflow = async () => {
    // If only root node is present or no action nodes
    if (canvasWorkflowNodes.length <= 1) {
      toast.error("Please add steps or describe a workflow in the chat first");
      return;
    }

    try {
      setSaving(true);
      const payload = getWorkflowPayload();

      if (currentRuleId) {
        const updated = await api.automations.update(currentRuleId, payload);
        setRules((prev) => prev.map((r) => (r.id === currentRuleId ? updated : r)));
        setRuleName(updated.name);
        toast.success("🎉 Workflow successfully updated and activated!");
      } else {
        const created = await api.automations.create(payload);
        setCurrentRuleId(created.id);
        setRuleName(created.name);
        setRules((prev) => [created, ...prev]);
        toast.success("🎉 Workflow saved and activated!");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-save-${Date.now()}`,
          role: "assistant",
          content: `✅ **"${payload.name}"** has been saved and activated! Incoming emails matching this criteria will now automatically run through this workflow.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          suggestedActions: ["Test & Simulate Flow", "View Activity Logs", "Build another workflow"],
        },
      ]);
    } catch (err: any) {
      console.error("Failed to save workflow:", err);
      toast.error(err?.message || "Failed to save workflow");
    } finally {
      setSaving(false);
    }
  };

  // Test / Simulate Workflow Execution
  const handleRunSimulation = async () => {
    try {
      setSimulating(true);
      setSimulationResult(null);
      const payload = getWorkflowPayload();

      let emailIdToSend: string | undefined = undefined;
      let customEmailToSend: any = undefined;

      if (selectedTestEmailId === "custom") {
        customEmailToSend = {
          from: { name: customTestSender || "Sender", email: customTestSender || "sender@example.com" },
          subject: customTestSubject || "Sample Subject",
          body: customTestBody || "Sample email body content.",
          snippet: customTestBody || "Sample email body content.",
          folder: "inbox",
        };
      } else if (selectedTestEmailId !== "latest") {
        emailIdToSend = selectedTestEmailId;
      }

      const res = await api.automations.simulate({
        rule_id: currentRuleId || undefined,
        rule_data: payload,
        email_id: emailIdToSend,
        custom_email: customEmailToSend,
        live_execute: liveExecuteToggle,
      });

      setSimulationResult(res);
      if (res.matched) {
        toast.success(liveExecuteToggle ? "🚀 Workflow executed on email!" : "✨ Workflow criteria matched!");
      } else {
        toast.info("ℹ️ Email did not match workflow criteria");
      }
    } catch (err: any) {
      console.error("Simulation error:", err);
      toast.error(err?.message || "Failed to run simulation");
    } finally {
      setSimulating(false);
    }
  };

  // Batch run workflow on user's recent inbox emails
  const handleRunBatchInbox = async (ruleIdToRun?: string) => {
    const targetId = ruleIdToRun || currentRuleId;
    if (!targetId) {
      toast.error("Please save the workflow first to run it over your inbox");
      return;
    }
    try {
      setBatchRunning(true);
      setBatchResult(null);
      const res = await api.automations.runInbox(targetId, 20);
      setBatchResult(res);
      toast.success(`Processed inbox: ${res.matched_count} matching emails executed!`);
      loadData(); // reload activity logs
    } catch (err: any) {
      console.error("Batch inbox error:", err);
      toast.error(err?.message || "Failed to run workflow on inbox");
    } finally {
      setBatchRunning(false);
    }
  };

  // Reset to new workflow
  const handleResetWorkflow = () => {
    setCurrentRuleId(null);
    setRuleName("New Workflow");
    setRuleDescription("Describe your workflow in the chat to get started");
    setWorkflowSpec({});
    setIsActive(true);
    setSelectedNodeId(null);
    setCanvasWorkflowNodes([
      {
        id: "node_trigger_mail",
        type: "trigger",
        title: "Incoming Mails",
        description: "All incoming emails — chat to build your flow",
        prompt: "Trigger: Intercept all incoming email events in real-time",
        icon: Mail,
        color: "emerald",
        badge: "Root Ingest",
        metrics: "Real-time",
        position: { x: 50, y: 170 },
      },
    ]);
    setCanvasWorkflowConnections([]);
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-reset-${Date.now()}`,
        role: "assistant",
        content: "Canvas cleared! Describe your new workflow and I'll build it for you.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedActions: [
          "Invoice & Receipt Router",
          "VIP Executive Escalation",
          "Support Auto-Responder",
        ],
      },
    ]);
    toast.info("Started a new blank workflow");
  };

  // Load a saved rule into current studio state
  const handleSelectRule = (rule: AutomationRule) => {
    setCurrentRuleId(rule.id);
    setRuleName(rule.name);
    setRuleDescription(rule.description || "");
    setWorkflowSpec({
      name: rule.name,
      description: rule.description,
      trigger_type: rule.trigger_type,
      trigger_value: rule.trigger_value,
      action_type: rule.action_type,
      use_ai_reply: rule.use_ai_reply,
      reply_prompt: rule.reply_prompt,
      reply_template: rule.reply_template,
      forward_to: rule.forward_to,
      forward_note: rule.forward_note,
      tag_name: rule.tag_name,
      is_active: rule.is_active,
    });
    setIsActive(rule.is_active);

    // If graph_nodes is saved in DB, load the exact visual graph!
    if (rule.graph_nodes && rule.graph_nodes.length > 0) {
      setCanvasWorkflowNodes(apiNodesToCanvasNodes(rule.graph_nodes));
      setCanvasWorkflowConnections(
        rule.graph_edges?.map((e: any) => ({
          from: e.from || e[0],
          to: e.to || e[1],
        })) || []
      );
    } else {
      // Rebuild canvas fallback for legacy rules
      const newNodes: WorkflowNode[] = [
        {
          id: "node_trigger_mail",
          type: "trigger",
          title: "Incoming Mails",
          description: `Filter: ${rule.trigger_type} ("${rule.trigger_value}")`,
          prompt: `Filter: ${rule.trigger_value}`,
          icon: Mail,
          color: "emerald",
          badge: "Trigger",
          metrics: "Real-time",
          position: { x: 50, y: 170 },
        },
        {
          id: "node_evaluator",
          type: "evaluator",
          title: "AI Condition Check",
          description: `Evaluates if email matches: "${rule.trigger_value}"`,
          prompt: `Evaluate if email matches: ${rule.trigger_value}`,
          icon: Cpu,
          color: "blue",
          badge: "Condition",
          metrics: "~120ms",
          position: { x: 370, y: 170 },
        },
        {
          id: "node_action_primary",
          type: "action",
          title:
            rule.action_type === "reply"
              ? rule.use_ai_reply
                ? "AI Auto-Reply"
                : "Template Reply"
              : rule.action_type === "forward"
              ? `Forward to ${rule.forward_to}`
              : rule.action_type.charAt(0).toUpperCase() + rule.action_type.slice(1),
          description:
            rule.action_type === "reply"
              ? rule.reply_prompt || rule.reply_template || "Automated reply"
              : rule.action_type === "forward"
              ? rule.forward_note || "Auto-forward"
              : rule.action_type === "tag"
              ? `Tag: ${rule.tag_name}`
              : rule.action_type,
          prompt: rule.reply_prompt || rule.forward_note || "Dispatches automated action",
          icon: resolveIcon("action", rule.action_type),
          color: "orange",
          badge: "Action",
          metrics: "Dispatched",
          position: { x: 690, y: 170 },
        },
      ];
      setCanvasWorkflowNodes(newNodes);
      setCanvasWorkflowConnections([
        { from: "node_trigger_mail", to: "node_evaluator" },
        { from: "node_evaluator", to: "node_action_primary" },
      ]);
    }
    setShowRulesDrawer(false);
    toast.success(`Loaded workflow "${rule.name}"`);
  };

  // Delete saved rule
  const handleDeleteRule = async (ruleId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.automations.delete(ruleId);
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      if (currentRuleId === ruleId) {
        handleResetWorkflow();
      }
      toast.success("Workflow deleted");
    } catch (err) {
      toast.error("Failed to delete workflow");
    }
  };

  return (
    <div
      className="flex flex-col h-screen w-full text-foreground overflow-hidden font-sans bg-background"
      suppressHydrationWarning
    >
      {/* Top Main Application Header */}
      <Header />

      {/* Main Studio Body Container */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Shared Sidebar */}
        <Sidebar />

        {/* Studio Center Workspace */}
        <div className="flex-1 flex flex-col min-w-0 bg-card overflow-hidden">
          {/* ========================================================= */}
          {/* UNIFIED STUDIO TOOLBAR (Ultra-Clean Single Header) */}
          {/* ========================================================= */}
          <div className="px-6 py-3 border-b border-border bg-card flex items-center justify-between gap-4 shrink-0 z-20">
            {/* Left: Workflow Title & Status */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xs shrink-0">
                <Zap className="h-4 w-4 fill-white/20" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {isEditingTitle ? (
                    <input
                      type="text"
                      value={ruleName}
                      onChange={(e) => setRuleName(e.target.value)}
                      onBlur={() => setIsEditingTitle(false)}
                      onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
                      autoFocus
                      className="text-sm font-bold text-foreground border-b border-indigo-500 outline-none px-1 bg-transparent"
                    />
                  ) : (
                    <h2
                      onClick={() => setIsEditingTitle(true)}
                      className="text-sm font-bold text-foreground truncate hover:text-indigo-600 transition cursor-pointer flex items-center gap-1.5 group"
                      title="Click to rename workflow"
                    >
                      <span>{ruleName}</span>
                      <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h2>
                  )}

                  {/* Active / Paused Pill */}
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer active:scale-95",
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                      )}
                    />
                    {isActive ? "Live" : "Draft"}
                  </button>

                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    AI Powered
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground truncate mt-0.5 max-w-[400px]">
                  {ruleDescription}
                </p>
              </div>
            </div>

            {/* Right: Studio Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => alignNodesRef.current?.()}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition shadow-2xs cursor-pointer active:scale-[0.98]"
                title="Auto-align canvas nodes"
              >
                <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Auto Align</span>
              </button>

              <button
                onClick={() => addNodeRef.current?.()}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition shadow-2xs cursor-pointer active:scale-[0.98]"
                title="Add step to pipeline"
              >
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Add Step</span>
              </button>

              <button
                onClick={handleResetWorkflow}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl border border-border transition cursor-pointer"
                title="New Blank Workflow"
              >
                <Plus className="h-4 w-4" />
              </button>

              {/* Test & Simulate Button */}
              <button
                onClick={() => setShowTestDrawer(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition shadow-2xs cursor-pointer active:scale-[0.98]"
                title="Test & Simulate Workflow Live"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Test Flow</span>
              </button>

              <button
                onClick={() => setShowLogsDrawer(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition shadow-2xs cursor-pointer active:scale-[0.98]"
                title="View Activity Logs"
              >
                <History className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Activity</span>
              </button>

              <button
                onClick={handleSaveWorkflow}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl shadow-xs shadow-indigo-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Activity className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>{currentRuleId ? "Update Flow" : "Save & Activate"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2-PANE STUDIO WORKSPACE (Left Chat + Right Canvas) */}
          {/* ========================================================= */}
          <div className="flex flex-1 min-w-0 overflow-hidden relative">
            {/* LEFT PANE: AI Workflow Architect Chat */}
            <div className="w-[390px] xl:w-[440px] flex flex-col border-r border-border bg-card shrink-0 z-10">
              {/* Chat Header */}
              <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">
                      AI Workflow Architect
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      Chat to design & compile DAG flow
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowRulesDrawer(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition cursor-pointer"
                >
                  <FolderOpen className="h-3 w-3 text-slate-500" />
                  <span>Workflows ({rules.length})</span>
                </button>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3 text-xs leading-relaxed animate-in fade-in-50 duration-200",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-2xs",
                        msg.role === "user"
                          ? "bg-foreground text-background"
                          : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                      )}
                    >
                      {msg.role === "user" ? (
                        <User className="h-3.5 w-3.5" />
                      ) : (
                        <Bot className="h-3.5 w-3.5" />
                      )}
                    </div>

                    {/* Message Bubble & Content */}
                    <div
                      className={cn(
                        "max-w-[85%] space-y-2.5",
                        msg.role === "user" ? "items-end" : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "p-3 rounded-2xl",
                          msg.role === "user"
                            ? "bg-indigo-600 text-white rounded-tr-xs"
                            : "bg-muted text-foreground border border-border rounded-tl-xs shadow-2xs"
                        )}
                      >
                        <FormattedMessage
                          content={msg.content}
                          isUser={msg.role === "user"}
                        />
                      </div>

                      {/* Suggested Quick Prompt Chips */}
                      {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.suggestedActions.map((action, i) => (
                            <button
                              key={i}
                              onClick={() => handleChatSubmit(action)}
                              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-card hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-foreground hover:text-indigo-700 border border-border hover:border-indigo-200 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                            >
                              <Sparkles className="h-2.5 w-2.5 text-indigo-500" />
                              <span>{action}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* AI Thinking Animation */}
                {chatLoading && (
                  <div className="flex gap-3 text-xs leading-relaxed animate-in fade-in-50">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xs">
                      <Bot className="h-3.5 w-3.5 animate-pulse" />
                    </div>
                    <div className="p-3 px-4 rounded-2xl bg-muted border border-border text-muted-foreground flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                      <span className="text-xs font-medium">
                        Designing workflow...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Container */}
              <div className="p-3.5 border-t border-border bg-card">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleChatSubmit();
                  }}
                  className="relative rounded-2xl border border-border bg-muted/30 p-1.5 focus-within:border-indigo-500 focus-within:bg-card focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-2xs"
                >
                  <textarea
                    rows={2}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSubmit();
                      }
                    }}
                    placeholder="Describe your workflow (e.g. 'When an invoice arrives, forward to accounting and reply')..."
                    className="w-full resize-none bg-transparent px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />

                  <div className="flex items-center justify-between px-2 pt-1 border-t border-border/50 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-indigo-500" />
                      <span>AI Powered Workflow Studio</span>
                    </span>

                    <button
                      type="submit"
                      disabled={!chatInput.trim() || chatLoading}
                      className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white transition disabled:opacity-40 cursor-pointer shadow-xs"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* RIGHT PANE: Interactive Drag & Connect Canvas + Slide-over Inspector */}
            <div className="flex-1 flex relative overflow-hidden bg-muted/30 dark:bg-background/50">
              <N8nWorkflowCanvas
                nodes={canvasWorkflowNodes}
                connections={canvasWorkflowConnections}
                selectedNodeId={selectedNodeId}
                onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                onAddNodeRef={addNodeRef}
                onAlignNodesRef={alignNodesRef}
              />

              {/* SLIDE-OVER NODE INSPECTOR PANEL (Right Drawer) */}
              {selectedNodeId && (() => {
                const activeNode = canvasWorkflowNodes.find((n) => n.id === selectedNodeId);
                if (!activeNode) return null;
                const Icon = activeNode.icon || Cpu;

                return (
                  <div className="w-[340px] xl:w-[370px] border-l border-border bg-card/95 backdrop-blur-md flex flex-col h-full shadow-lg z-30 animate-in slide-in-from-right-4 duration-200">
                    {/* Inspector Header */}
                    <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-muted/30">
                      <div className="flex items-center gap-2 min-w-0">
                        <SlidersHorizontal className="h-4 w-4 text-indigo-600 shrink-0" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground truncate">
                          Step Settings
                        </h4>
                      </div>
                      <button
                        onClick={() => setSelectedNodeId(null)}
                        className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Inspector Body */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-foreground">
                      {/* Node Header Card */}
                      <div className="p-3.5 rounded-2xl bg-muted border border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-card border border-border shadow-2xs text-foreground">
                              <Icon className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div>
                              <span className="font-mono text-[10px] text-muted-foreground block uppercase">
                                {activeNode.type} Step
                              </span>
                              <h5 className="font-bold text-foreground text-xs">
                                {activeNode.title}
                              </h5>
                            </div>
                          </div>
                          {activeNode.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {activeNode.badge}
                            </span>
                          )}
                        </div>
                        {activeNode.metrics && (
                          <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[10px] text-muted-foreground font-mono">
                            <span>Status: Active</span>
                            <span className="text-emerald-600 font-semibold">{activeNode.metrics}</span>
                          </div>
                        )}
                      </div>

                      {/* Title Edit */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-foreground">
                          Step Title:
                        </label>
                        <input
                          type="text"
                          value={activeNode.title}
                          onChange={(e) => updateSelectedNode({ title: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition"
                        />
                      </div>

                      {/* Description / Prompt Edit */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-foreground">
                          {activeNode.type === "trigger"
                            ? "Trigger Condition / Criteria:"
                            : activeNode.type === "evaluator"
                            ? "Evaluation Criteria / Prompt:"
                            : activeNode.type === "action"
                            ? "Action Instructions:"
                            : "Step Instructions:"}
                        </label>
                        <textarea
                          rows={4}
                          value={activeNode.prompt || activeNode.description || ""}
                          onChange={(e) => updateSelectedNode({ prompt: e.target.value, description: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs leading-relaxed focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition resize-none"
                          placeholder="Enter instructions or criteria..."
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Directly updates how this step executes in the workflow.
                        </p>
                      </div>

                      {/* Node Type Specific Extras */}
                      {activeNode.type === "trigger" && (
                        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-900 space-y-1">
                          <span className="font-bold text-[11px] block">Trigger Policy:</span>
                          <p className="text-[10px] text-emerald-800/80 leading-relaxed">
                            Monitors incoming emails matching the criteria above to initiate the workflow.
                          </p>
                        </div>
                      )}

                      {activeNode.type === "evaluator" && (
                        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-900 space-y-1">
                          <span className="font-bold text-[11px] block">AI Smart Evaluation:</span>
                          <p className="text-[10px] text-blue-800/80 leading-relaxed">
                            Evaluates incoming emails against criteria and branches conditionally to action steps.
                          </p>
                        </div>
                      )}

                      {activeNode.type === "action" && (
                        <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-100 text-orange-900 space-y-1">
                          <span className="font-bold text-[11px] block">Action Execution:</span>
                          <p className="text-[10px] text-orange-800/80 leading-relaxed">
                            Dispatched automatically when condition evaluates to True.
                          </p>
                        </div>
                      )}

                      {/* Color Theme Selector */}
                      <div className="space-y-1.5 pt-2 border-t border-border">
                        <label className="block text-[11px] font-bold text-foreground">
                          Node Theme Color:
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {(["emerald", "blue", "purple", "orange", "rose", "teal", "amber", "indigo"] as const).map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => updateSelectedNode({ color })}
                              className={cn(
                                "py-1.5 px-2 rounded-xl text-[10px] font-bold capitalize border transition cursor-pointer text-center",
                                activeNode.color === color
                                  ? "bg-foreground text-background border-foreground shadow-2xs"
                                  : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
                              )}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Delete Node (if not root trigger) */}
                      {activeNode.id !== "node_trigger_mail" && (
                        <div className="pt-3 border-t border-border">
                          <button
                            type="button"
                            onClick={deleteSelectedNode}
                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Remove Node from Canvas</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SAVED WORKFLOWS DRAWER (Slide-over) */}
      {/* ========================================================= */}
      {showRulesDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-[420px] bg-card h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-foreground">
                  Saved Workflows ({rules.length})
                </h3>
              </div>
              <button
                onClick={() => setShowRulesDrawer(false)}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {rules.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Layers className="h-8 w-8 mx-auto opacity-40" />
                  <p className="text-xs">No saved workflows found yet.</p>
                </div>
              ) : (
                rules.map((rule) => (
                  <div
                    key={rule.id}
                    onClick={() => handleSelectRule(rule)}
                    className="p-4 rounded-2xl border border-border bg-card hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            rule.is_active ? "bg-emerald-500" : "bg-slate-300"
                          )}
                        />
                        <h4 className="text-xs font-bold text-foreground truncate">
                          {rule.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRunBatchInbox(rule.id);
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Run this workflow over recent inbox emails"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteRule(rule.id, e)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete workflow"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {rule.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {rule.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                          {rule.trigger_type}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                          {rule.action_type}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono">
                        Runs: {rule.execution_count || 0}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ACTIVITY LOGS DRAWER (Slide-over) */}
      {/* ========================================================= */}
      {showLogsDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-[460px] bg-card h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-foreground">
                  Workflow Execution History
                </h3>
              </div>
              <button
                onClick={() => setShowLogsDrawer(false)}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Activity className="h-8 w-8 mx-auto opacity-40" />
                  <p className="text-xs">No execution history recorded yet.</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl border border-border bg-muted/50 space-y-1.5 text-xs text-foreground"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-600">{log.rule_name}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "Just now"}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Evaluated: &ldquo;{log.email_subject}&rdquo; from {log.email_sender}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-border text-[10px]">
                      <span
                        className={cn(
                          "font-semibold uppercase tracking-wider",
                          log.action_executed ? "text-emerald-600" : "text-slate-400"
                        )}
                      >
                        {log.action_executed ? `Dispatched: ${log.action_executed}` : "Condition Unmatched"}
                      </span>
                      <span className="text-slate-400">Execution: Normal</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* WORKFLOW TEST & SIMULATION DRAWER (Slide-over) */}
      {/* ========================================================= */}
      {showTestDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-[520px] max-w-full bg-card h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-border">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <Play className="h-4 w-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Workflow Test & Simulation
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Simulate real-time trigger evaluation & action execution
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTestDrawer(false)}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Test Email Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-foreground">
                  Select Email to Test Against:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTestEmailId("latest")}
                    className={cn(
                      "py-2 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer",
                      selectedTestEmailId === "latest"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                        : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    Latest Inbox Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTestEmailId("select")}
                    className={cn(
                      "py-2 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer",
                      selectedTestEmailId === "select" || (selectedTestEmailId !== "latest" && selectedTestEmailId !== "custom")
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                        : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    Inbox Dropdown
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTestEmailId("custom")}
                    className={cn(
                      "py-2 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer",
                      selectedTestEmailId === "custom"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                        : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    Custom Sample
                  </button>
                </div>

                {/* Inbox dropdown list */}
                {(selectedTestEmailId === "select" || (selectedTestEmailId !== "latest" && selectedTestEmailId !== "custom")) && (
                  <div className="space-y-1.5 pt-1">
                    <select
                      value={selectedTestEmailId}
                      onChange={(e) => setSelectedTestEmailId(e.target.value)}
                      className="w-full text-xs font-medium bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="latest">Select an email from inbox...</option>
                      {recentEmails.slice(0, 15).map((em) => (
                        <option key={em.id} value={em.id}>
                          {(em.from_contact?.name || em.from_contact?.email || "Sender")}: &ldquo;{em.subject}&rdquo;
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Custom Sample Input Form */}
                {selectedTestEmailId === "custom" && (
                  <div className="p-3.5 rounded-2xl border border-border bg-muted/40 space-y-2.5 animate-in fade-in-50">
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                        Sender Email / Name
                      </label>
                      <input
                        type="text"
                        value={customTestSender}
                        onChange={(e) => setCustomTestSender(e.target.value)}
                        placeholder="e.g. notifications@github.com"
                        className="w-full text-xs bg-background border border-border rounded-xl px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                        Subject Line
                      </label>
                      <input
                        type="text"
                        value={customTestSubject}
                        onChange={(e) => setCustomTestSubject(e.target.value)}
                        placeholder="e.g. Action Required: Pull Request Review"
                        className="w-full text-xs bg-background border border-border rounded-xl px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                        Body Content
                      </label>
                      <textarea
                        rows={2}
                        value={customTestBody}
                        onChange={(e) => setCustomTestBody(e.target.value)}
                        placeholder="Email body text..."
                        className="w-full text-xs bg-background border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Execution Options & Trigger Actions */}
              <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-foreground">Live Execution Mode</span>
                    <p className="text-[10px] text-muted-foreground">
                      {liveExecuteToggle
                        ? "Real Action: Sends email / tags / stars in Gmail"
                        : "Dry Run: Safe simulation without modifying mail"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLiveExecuteToggle(!liveExecuteToggle)}
                    className={cn(
                      "px-3 py-1 text-xs font-bold rounded-xl border transition cursor-pointer",
                      liveExecuteToggle
                        ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                    )}
                  >
                    {liveExecuteToggle ? "Live ON" : "Dry Run"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleRunSimulation}
                    disabled={simulating}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {simulating ? (
                      <>
                        <Activity className="h-3.5 w-3.5 animate-spin" />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Run Simulation</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRunBatchInbox()}
                    disabled={batchRunning}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold bg-card hover:bg-muted border border-border text-foreground rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {batchRunning ? (
                      <>
                        <Activity className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                        <span>Scanning...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        <span>Run on Inbox (20)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Simulation Result Trace */}
              {simulationResult && (
                <div className="space-y-3 animate-in fade-in-50 duration-300">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground">Pipeline Execution Trace</h4>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        simulationResult.matched
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      )}
                    >
                      {simulationResult.matched ? "Matched Criteria" : "Unmatched"}
                    </span>
                  </div>

                  {/* Tested email info */}
                  {simulationResult.tested_email && (
                    <div className="p-3 rounded-xl border border-border bg-card text-xs space-y-1">
                      <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                        <span>Tested Email</span>
                        <span className="font-mono">{simulationResult.tested_email.id?.slice(0, 8)}</span>
                      </div>
                      <p className="font-bold text-foreground truncate">
                        {simulationResult.tested_email.subject}
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        From: {simulationResult.tested_email.sender_name} &lt;{simulationResult.tested_email.sender}&gt;
                      </p>
                    </div>
                  )}

                  {/* Step list */}
                  <div className="space-y-2">
                    {simulationResult.steps?.map((step: any, idx: number) => (
                      <div
                        key={step.id || idx}
                        className="p-3 rounded-xl border border-border bg-card space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                step.status === "completed"
                                  ? "bg-emerald-500"
                                  : step.status === "skipped"
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              )}
                            />
                            <span className="font-bold text-foreground">{step.name}</span>
                          </div>
                          <span className="text-[10px] capitalize text-muted-foreground font-mono">
                            {step.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground pl-4">
                          {step.detail}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Action Preview output */}
                  {simulationResult.output_preview && (
                    <div className="p-3.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600">
                        <span>Generated Action Output</span>
                        <span>{simulationResult.action_type?.toUpperCase()}</span>
                      </div>
                      <pre className="text-xs text-foreground font-mono whitespace-pre-wrap bg-card/80 p-2.5 rounded-xl border border-border">
                        {simulationResult.output_preview}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Batch Result */}
              {batchResult && (
                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 animate-in fade-in-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700">
                      Batch Inbox Run Completed
                    </span>
                    <span className="text-xs font-bold text-emerald-800">
                      {batchResult.matched_count} / {batchResult.total_scanned} Matched
                    </span>
                  </div>

                  {batchResult.results?.length > 0 && (
                    <div className="space-y-2 pt-1 max-h-48 overflow-y-auto">
                      {batchResult.results.map((item: any, i: number) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-card border border-border text-xs space-y-0.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground truncate max-w-[260px]">
                              {item.subject}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold uppercase">
                              {item.action_type}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">From: {item.sender}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
