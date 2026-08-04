"use client";

import { motion, type PanInfo } from "framer-motion";
import type React from "react";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  ArrowRight,
  Database,
  Mail,
  Plus,
  Settings,
  Webhook,
  Zap,
  ShieldCheck,
  Bot,
  Send,
  Share2,
  Tag,
  Star,
  Archive,
  Activity,
  RotateCcw,
  Sparkles,
  Layers,
  Cpu,
  GitBranch,
  Sliders,
  CheckCircle2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  MousePointer,
  ChevronRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorkflowNode {
  id: string;
  type: "trigger" | "evaluator" | "guard" | "action" | "telemetry" | "condition";
  title: string;
  description: string;
  prompt?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "emerald" | "blue" | "amber" | "purple" | "indigo" | "rose" | "teal" | "orange";
  position: { x: number; y: number };
  badge?: string;
  metrics?: string;
}

export interface WorkflowConnection {
  from: string;
  to: string;
}

const NODE_WIDTH = 275;
const NODE_HEIGHT = 140;

const nodeThemes: Record<
  string,
  {
    ring: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    iconBg: string;
    iconText: string;
    portBg: string;
    glow: string;
    hoverGlow: string;
  }
> = {
  emerald: {
    ring: "focus-within:ring-emerald-500/40 hover:border-emerald-300",
    border: "border-emerald-200/80",
    badgeBg: "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-700",
    iconBg: "bg-emerald-500/10 text-emerald-600 border-emerald-200/60",
    iconText: "text-emerald-600",
    portBg: "bg-emerald-500",
    glow: "shadow-emerald-500/10",
    hoverGlow: "hover:shadow-[0_0_24px_rgba(16,185,129,0.22)] hover:border-emerald-400",
  },
  blue: {
    ring: "focus-within:ring-blue-500/40 hover:border-blue-300",
    border: "border-blue-200/80",
    badgeBg: "bg-blue-50 border-blue-200",
    badgeText: "text-blue-700",
    iconBg: "bg-blue-500/10 text-blue-600 border-blue-200/60",
    iconText: "text-blue-600",
    portBg: "bg-blue-500",
    glow: "shadow-blue-500/10",
    hoverGlow: "hover:shadow-[0_0_24px_rgba(59,130,246,0.22)] hover:border-blue-400",
  },
  amber: {
    ring: "focus-within:ring-amber-500/40 hover:border-amber-300",
    border: "border-amber-200/80",
    badgeBg: "bg-amber-50 border-amber-200",
    badgeText: "text-amber-700",
    iconBg: "bg-amber-500/10 text-amber-600 border-amber-200/60",
    iconText: "text-amber-600",
    portBg: "bg-amber-500",
    glow: "shadow-amber-500/10",
    hoverGlow: "hover:shadow-[0_0_24px_rgba(245,158,11,0.22)] hover:border-amber-400",
  },
  purple: {
    ring: "focus-within:ring-purple-500/40 hover:border-purple-300",
    border: "border-purple-200/80",
    badgeBg: "bg-purple-50 border-purple-200",
    badgeText: "text-purple-700",
    iconBg: "bg-purple-500/10 text-purple-600 border-purple-200/60",
    iconText: "text-purple-600",
    portBg: "bg-purple-500",
    glow: "shadow-purple-500/10",
    hoverGlow: "hover:shadow-[0_0_24px_rgba(168,85,247,0.22)] hover:border-purple-400",
  },
  indigo: {
    ring: "focus-within:ring-indigo-500/40 hover:border-indigo-300",
    border: "border-indigo-200/80",
    badgeBg: "bg-indigo-50 border-indigo-200",
    badgeText: "text-indigo-700",
    iconBg: "bg-indigo-500/10 text-indigo-600 border-indigo-200/60",
    iconText: "text-indigo-600",
    portBg: "bg-indigo-500",
    glow: "shadow-indigo-500/10",
    hoverGlow: "hover:shadow-[0_0_24px_rgba(99,102,241,0.22)] hover:border-indigo-400",
  },
  rose: {
    ring: "focus-within:ring-rose-500/40 hover:border-rose-300",
    border: "border-rose-200/80",
    badgeBg: "bg-rose-50 border-rose-200",
    badgeText: "text-rose-700",
    iconBg: "bg-rose-500/10 text-rose-600 border-rose-200/60",
    iconText: "text-rose-600",
    portBg: "bg-rose-500",
    glow: "shadow-rose-500/10",
    hoverGlow: "hover:shadow-[0_0_24px_rgba(244,63,94,0.22)] hover:border-rose-400",
  },
  teal: {
    ring: "focus-within:ring-teal-500/40 hover:border-teal-300",
    border: "border-teal-200/80",
    badgeBg: "bg-teal-50 border-teal-200",
    badgeText: "text-teal-700",
    iconBg: "bg-teal-500/10 text-teal-600 border-teal-200/60",
    iconText: "text-teal-600",
    portBg: "bg-teal-500",
    glow: "shadow-teal-500/10",
    hoverGlow: "hover:shadow-[0_0_24px_rgba(20,184,166,0.22)] hover:border-teal-400",
  },
  orange: {
    ring: "focus-within:ring-orange-500/40 hover:border-orange-300",
    border: "border-orange-200/80",
    badgeBg: "bg-orange-50 border-orange-200",
    badgeText: "text-orange-700",
    iconBg: "bg-orange-500/10 text-orange-600 border-orange-200/60",
    iconText: "text-orange-600",
    portBg: "bg-orange-500",
    glow: "shadow-orange-500/10",
    hoverGlow: "hover:shadow-[0_0_24px_rgba(249,115,22,0.22)] hover:border-orange-400",
  },
};

function WorkflowConnectionLine({
  from,
  to,
  nodes,
}: {
  from: string;
  to: string;
  nodes: WorkflowNode[];
}) {
  const fromNode = nodes.find((n) => n.id === from);
  const toNode = nodes.find((n) => n.id === to);
  if (!fromNode || !toNode) return null;

  // Seamless connection flowing smoothly in the background through node centers
  const startX = fromNode.position.x + NODE_WIDTH / 2;
  const startY = fromNode.position.y + NODE_HEIGHT / 2;
  const endX = toNode.position.x + NODE_WIDTH / 2;
  const endY = toNode.position.y + NODE_HEIGHT / 2;

  const deltaX = Math.max(80, Math.abs(endX - startX) * 0.5);
  const cp1X = startX + deltaX;
  const cp2X = endX - deltaX;

  const path = `M${startX},${startY} C${cp1X},${startY} ${cp2X},${endY} ${endX},${endY}`;

  return (
    <g className="transition-all duration-150">
      {/* Ambient background glow wire */}
      <path
        d={path}
        fill="none"
        stroke="rgba(99, 102, 241, 0.12)"
        strokeWidth={8}
        strokeLinecap="round"
      />
      {/* Background guide path */}
      <path
        d={path}
        fill="none"
        stroke="#cbd5e1"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Active Flowing Animated Line */}
      <path
        d={path}
        fill="none"
        stroke="url(#wireGradient)"
        strokeWidth={2.5}
        strokeDasharray="6,6"
        strokeLinecap="round"
        className="animate-[dash_1.5s_linear_infinite]"
      />
    </g>
  );
}

interface N8nWorkflowCanvasProps {
  initialNodes?: WorkflowNode[];
  initialConnections?: WorkflowConnection[];
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  onAddNode?: (node: WorkflowNode) => void;
  onAlignNodesRef?: React.MutableRefObject<(() => void) | null>;
  onAddNodeRef?: React.MutableRefObject<(() => void) | null>;
}

export function N8nWorkflowCanvas({
  initialNodes: propNodes,
  initialConnections: propConnections,
  selectedNodeId,
  onSelectNode,
  onAddNode,
  onAlignNodesRef,
  onAddNodeRef,
}: N8nWorkflowCanvasProps) {
  const defaultNodes: WorkflowNode[] = [
    {
      id: "node_trigger_mail",
      type: "trigger",
      title: "Incoming Mails",
      description: "Trigger workflow on every new incoming email",
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
      description: "Evaluates email content and rules",
      icon: Cpu,
      color: "blue",
      badge: "Condition",
      metrics: "~120ms",
      position: { x: 370, y: 170 },
    },
    {
      id: "node_action_forward",
      type: "action",
      title: "Forward to Team",
      description: "Forward copy to team member",
      icon: Share2,
      color: "indigo",
      badge: "Action",
      metrics: "Dispatched",
      position: { x: 690, y: 170 },
    },
  ];

  const defaultConnections: WorkflowConnection[] = [
    { from: "node_trigger_mail", to: "node_evaluator" },
    { from: "node_evaluator", to: "node_action_forward" },
  ];

  const [nodes, setNodes] = useState<WorkflowNode[]>(propNodes || defaultNodes);
  const [connections, setConnections] = useState<WorkflowConnection[]>(
    propConnections || defaultConnections
  );
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [layoutKey, setLayoutKey] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<Record<string, { x: number; y: number }>>({});

  // Sync with propNodes and propConnections when updated by AI Chat, PRESERVING user-dragged positions!
  useEffect(() => {
    if (propNodes && propNodes.length > 0) {
      setNodes((prevNodes) => {
        return propNodes.map((pNode) => {
          const existing = prevNodes.find((n) => n.id === pNode.id);
          if (existing && existing.position) {
            return {
              ...pNode,
              position: existing.position, // Keep user's custom position!
            };
          }
          return pNode;
        });
      });
      if (propConnections && propConnections.length > 0) {
        setConnections(propConnections);
      }
    }
  }, [propNodes, propConnections]);

  // Compute bounding box
  const contentSize = nodes.reduce(
    (acc, node) => ({
      width: Math.max(acc.width, node.position.x + NODE_WIDTH + 300),
      height: Math.max(acc.height, node.position.y + NODE_HEIGHT + 300),
    }),
    { width: 1600, height: 700 }
  );

  const handleDragStart = (nodeId: string) => {
    setDraggingNodeId(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      dragStartPos.current[nodeId] = { ...node.position };
    }
  };

  const handleDrag = (nodeId: string, info: PanInfo) => {
    const origin = dragStartPos.current[nodeId];
    if (!origin) return;

    const newX = Math.max(20, origin.x + info.offset.x);
    const newY = Math.max(20, origin.y + info.offset.y);

    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, position: { x: newX, y: newY } } : n))
    );
  };

  const handleDragEnd = (nodeId: string, info: PanInfo) => {
    const origin = dragStartPos.current[nodeId];
    if (origin) {
      const finalX = Math.max(20, origin.x + info.offset.x);
      const finalY = Math.max(20, origin.y + info.offset.y);
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId ? { ...n, position: { x: finalX, y: finalY } } : n
        )
      );
      setLayoutKey((k) => k + 1);
    }
    setDraggingNodeId(null);
    delete dragStartPos.current[nodeId];
  };

  // Topological Tree Layout: Groups nodes into stages and distributes branch Y positions
  const handleAlignNodes = useCallback(() => {
    const SPACING_X = 320;
    const START_X = 50;
    const CENTER_Y = 170;
    const BRANCH_OFFSET_Y = 90;

    // Calculate in-degree to find root nodes
    const inDegree: Record<string, number> = {};
    const adj: Record<string, string[]> = {};
    nodes.forEach((n) => {
      inDegree[n.id] = 0;
      adj[n.id] = [];
    });

    connections.forEach((c) => {
      if (inDegree[c.to] !== undefined) inDegree[c.to]++;
      if (adj[c.from]) adj[c.from].push(c.to);
    });

    // Compute stage/depth for each node
    const stage: Record<string, number> = {};
    const roots = nodes.filter((n) => (inDegree[n.id] || 0) === 0);

    const queue: { id: string; depth: number }[] = roots.map((r) => ({
      id: r.id,
      depth: 0,
    }));
    roots.forEach((r) => {
      stage[r.id] = 0;
    });

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      (adj[id] || []).forEach((nextId) => {
        const nextDepth = Math.max(stage[nextId] || 0, depth + 1);
        stage[nextId] = nextDepth;
        queue.push({ id: nextId, depth: nextDepth });
      });
    }

    // Group nodes by stage
    const stageGroups: Record<number, string[]> = {};
    nodes.forEach((n) => {
      const s = stage[n.id] ?? 0;
      if (!stageGroups[s]) stageGroups[s] = [];
      stageGroups[s].push(n.id);
    });

    // Assign positions
    const newPositions: Record<string, { x: number; y: number }> = {};
    Object.entries(stageGroups).forEach(([stageStr, group]) => {
      const s = parseInt(stageStr, 10);
      const x = START_X + s * SPACING_X;

      if (group.length === 1) {
        newPositions[group[0]] = { x, y: CENTER_Y };
      } else {
        group.forEach((id, idx) => {
          const total = group.length;
          const y =
            CENTER_Y + (idx - (total - 1) / 2) * (BRANCH_OFFSET_Y * 2);
          newPositions[id] = { x, y };
        });
      }
    });

    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        position: newPositions[n.id] || n.position,
      }))
    );

    setLayoutKey((k) => k + 1);

    if (canvasRef.current) {
      canvasRef.current.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    }
  }, [nodes, connections]);

  const handleAddCustomNode = useCallback(() => {
    const templates = [
      {
        type: "condition" as const,
        title: "Filter Condition",
        description: "Check VIP sender or urgency score",
        icon: Settings,
        color: "amber" as const,
        badge: "Condition",
        metrics: "Custom",
      },
      {
        type: "action" as const,
        title: "Star Message",
        description: "Flag in priority inbox",
        icon: Star,
        color: "purple" as const,
        badge: "Action",
        metrics: "Priority",
      },
      {
        type: "action" as const,
        title: "Tag Label",
        description: "Apply custom label tag",
        icon: Tag,
        color: "rose" as const,
        badge: "Action",
        metrics: "Tag",
      },
      {
        type: "action" as const,
        title: "Forward Email",
        description: "Forward copy to teammate",
        icon: Share2,
        color: "blue" as const,
        badge: "Action",
        metrics: "Dispatch",
      },
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    const lastNode = nodes[nodes.length - 1];
    const newPosition = lastNode
      ? { x: lastNode.position.x + 320, y: lastNode.position.y }
      : { x: 50, y: 150 };

    const newNode: WorkflowNode = {
      id: `custom-node-${Date.now()}`,
      ...template,
      position: newPosition,
    };

    setNodes((prev) => [...prev, newNode]);
    if (lastNode) {
      setConnections((prev) => [...prev, { from: lastNode.id, to: newNode.id }]);
    }

    if (onAddNode) {
      onAddNode(newNode);
    }

    if (canvasRef.current) {
      canvasRef.current.scrollTo({
        left: newPosition.x + NODE_WIDTH - canvasRef.current.clientWidth + 150,
        behavior: "smooth",
      });
    }
  }, [nodes, onAddNode]);

  // Expose handlers to parent toolbar if requested
  useEffect(() => {
    if (onAlignNodesRef) {
      onAlignNodesRef.current = handleAlignNodes;
    }
    if (onAddNodeRef) {
      onAddNodeRef.current = handleAddCustomNode;
    }
  }, [handleAlignNodes, handleAddCustomNode, onAlignNodesRef, onAddNodeRef]);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(150, Math.max(60, prev + delta)));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
    handleAlignNodes();
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-50/50 select-none">
      {/* SVG Filters & Gradient Definitions */}
      <svg className="sr-only" aria-hidden="true">
        <defs>
          <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Main Canvas Scroll Area */}
      <div
        ref={canvasRef}
        className="relative flex-1 w-full overflow-auto p-8 cursor-grab active:cursor-grabbing no-scrollbar"
        style={{
          backgroundImage: "radial-gradient(#e2e8f0 1.2px, transparent 1.2px)",
          backgroundSize: "24px 24px",
        }}
        role="region"
        aria-label="Workflow canvas"
        tabIndex={0}
      >
        {/* Transformable Canvas Content Wrapper */}
        <div
          className="relative origin-top-left transition-transform duration-100 ease-out"
          style={{
            minWidth: contentSize.width,
            minHeight: contentSize.height,
            transform: `scale(${zoomLevel / 100})`,
          }}
        >
          {/* SVG Connections Layer */}
          <svg
            className="absolute top-0 left-0 pointer-events-none z-0"
            width={contentSize.width}
            height={contentSize.height}
            style={{ overflow: "visible" }}
            aria-hidden="true"
          >
            {connections.map((c) => (
              <WorkflowConnectionLine
                key={`${c.from}-${c.to}`}
                from={c.from}
                to={c.to}
                nodes={nodes}
              />
            ))}
          </svg>

          {/* Draggable High-End Node Cards */}
          {nodes.map((node) => {
            const Icon = node.icon;
            const isDragging = draggingNodeId === node.id;
            const isSelected = selectedNodeId === node.id;
            const theme = nodeThemes[node.color] || nodeThemes.blue;

            return (
              <motion.div
                key={`${node.id}-${layoutKey}`}
                drag
                dragMomentum={false}
                dragConstraints={{
                  left: 10,
                  top: 10,
                  right: 100000,
                  bottom: 100000,
                }}
                onDragStart={() => handleDragStart(node.id)}
                onDrag={(_, info) => handleDrag(node.id, info)}
                onDragEnd={(_, info) => handleDragEnd(node.id, info)}
                onClick={() => onSelectNode && onSelectNode(node.id)}
                initial={{
                  x: node.position.x,
                  y: node.position.y,
                  opacity: 0,
                }}
                animate={{
                  x: node.position.x,
                  y: node.position.y,
                  opacity: 1,
                }}
                transition={{
                  duration: 0.18,
                  ease: "easeOut",
                }}
                whileDrag={{
                  zIndex: 50,
                  cursor: "grabbing",
                }}
                style={{
                  width: NODE_WIDTH,
                  position: "absolute",
                  left: 0,
                  top: 0,
                }}
                className="cursor-grab select-none z-10"
                aria-grabbed={isDragging}
              >
                {/* HIGH-END WORKFLOW NODE CARD */}
                <div
                  className={cn(
                    "group relative w-full rounded-2xl p-3.5 transition-all duration-200",
                    "bg-white border text-slate-800 shadow-xs",
                    theme.hoverGlow,
                    isSelected
                      ? "border-indigo-500 ring-2 ring-indigo-500/30 shadow-md shadow-indigo-500/10"
                      : "border-slate-200/90",
                    isDragging && "shadow-2xl ring-2 ring-indigo-500/50 opacity-95"
                  )}
                >
                  {/* Node Content */}
                  <div className="space-y-2">
                    {/* Top Row: Icon + Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border shadow-2xs",
                            theme.iconBg
                          )}
                          aria-hidden="true"
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <span
                            className={cn(
                              "inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-wider border",
                              theme.badgeBg,
                              theme.badgeText
                            )}
                          >
                            {node.badge || node.type}
                          </span>
                        </div>
                      </div>

                      {node.metrics && (
                        <span className="text-[10px] font-mono font-medium text-slate-400 shrink-0">
                          {node.metrics}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div>
                      <h4 className="text-xs font-bold tracking-tight text-slate-900 truncate">
                        {node.title}
                      </h4>
                    </div>

                    {/* PROMPT / LOGIC BOX EMBEDDED DIRECTLY IN NODE */}
                    {(node.prompt || node.description) && (
                      <div className="rounded-xl bg-slate-50/90 border border-slate-200/70 p-2 text-[11px] space-y-1">
                        <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          <Sparkles className="h-2.5 w-2.5 text-indigo-500 shrink-0" />
                          <span>
                            {node.type === "trigger"
                              ? "Trigger Condition"
                              : node.type === "evaluator"
                              ? "Evaluation Criteria"
                              : node.type === "action"
                              ? "Action Instructions"
                              : "Instructions"}
                          </span>
                        </div>
                        <p className="line-clamp-3 text-slate-700 font-sans text-[11px] leading-relaxed break-words">
                          {node.prompt || node.description}
                        </p>
                      </div>
                    )}

                    {/* Footer Affordance */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                          Step Validated
                        </span>
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-semibold flex items-center gap-0.5 transition-colors",
                          isSelected
                            ? "text-indigo-600 font-bold"
                            : "text-slate-400 group-hover:text-indigo-600"
                        )}
                      >
                        Inspect <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Floating Canvas Dock / Quick Controls */}
      <div className="absolute bottom-5 right-6 flex items-center gap-2 z-20">
        {/* Node & Wire Telemetry Badge */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-800 font-semibold">{nodes.length}</span>
            <span className="text-slate-400">nodes</span>
          </div>
          <span className="text-slate-200">|</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span className="text-slate-800 font-semibold">{connections.length}</span>
            <span className="text-slate-400">wires</span>
          </div>
        </div>

        {/* Zoom & Fit Toolbar */}
        <div className="flex items-center rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm p-0.5">
          <button
            onClick={() => handleZoom(-10)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 rounded-md transition cursor-pointer"
            title="Reset Zoom & Align"
          >
            {zoomLevel}%
          </button>
          <button
            onClick={() => handleZoom(10)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleAlignNodes}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer border-l border-slate-100"
            title="Auto Align Nodes"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
