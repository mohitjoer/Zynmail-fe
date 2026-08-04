"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  RotateCcw, 
  Copy, 
  Check, 
  Mail, 
  FileText, 
  Zap, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEmail } from "@/context/EmailContext";
import { cn } from "@/lib/utils";
import { FormattedMessage } from "@/components/chat/FormattedMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export default function ChatSidePanel() {
  const { isChatOpen, setIsChatOpen, selectedEmail } = useEmail();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Hello! I'm **Zyn**, your AI email co-pilot. I can summarize your emails, draft responses, find action items, or answer questions about your inbox. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isChatOpen]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isLoading) return;

    let enrichedContent = textToSend;
    // If referencing current selected email, attach email context if not already mentioned
    if (selectedEmail && !customPrompt?.includes("selected email")) {
      // we send normal message but if the user asks about this email, we enrich context
    }

    const userMessage: Message = { 
      role: "user", 
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Include email context if an email is currently selected
      const payloadMessages = newMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      // If user asks about the open email and an email is selected, add email details as background context
      if (selectedEmail) {
        payloadMessages.unshift({
          role: "assistant",
          content: `[Current Active Email Context: Subject: "${selectedEmail.subject}", From: "${selectedEmail.from_contact.name} <${selectedEmail.from_contact.email}>", Snippet: "${selectedEmail.snippet}"]`
        });
      }

      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages })
      });
      const data = await response.json();
      
      if (data.response) {
        setMessages([
          ...newMessages, 
          { 
            role: "assistant", 
            content: data.response,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...newMessages, 
        { 
          role: "assistant", 
          content: "Sorry, I encountered an issue connecting to the AI backend. Please verify your connection or try again in a moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      { 
        role: "assistant", 
        content: "Chat cleared! How can I assist you with your inbox now?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const quickPrompts = [
    { label: "Summarize active email", icon: FileText, prompt: "Can you provide a quick bullet-point summary of the currently selected email?", showIfSelected: true },
    { label: "Draft a polite reply", icon: Mail, prompt: "Please draft a concise, professional reply accepting their request.", showIfSelected: true },
    { label: "What needs reply?", icon: Zap, prompt: "Which recent emails require an urgent reply from me?" },
    { label: "Search my inbox", icon: FileText, prompt: "Search all my emails for recent important messages and give me an overview." },
    { label: "Create automation workflow", icon: Zap, prompt: "Create an automation workflow to forward invoice emails to accounting@zynmail.com and auto-reply to demo inquiries." },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden select-text">
      {/* Side Panel Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-gray-900 leading-none">Zyn AI Assistant</h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">Llama 3.1</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">Your email & inbox copilot</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleResetChat}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsChatOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Close side panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Selected Email Context Bar (if email open) */}
      {selectedEmail && (
        <div className="px-4 py-2 bg-blue-50/70 border-b border-blue-100/60 flex items-center justify-between text-xs text-blue-900 shrink-0">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <Mail className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="truncate font-medium">
              Context: <span className="font-normal text-blue-800">{selectedEmail.subject || "Current email"}</span>
            </span>
          </div>
          <span className="text-[10px] bg-blue-200/60 text-blue-800 px-1.5 py-0.5 rounded shrink-0">Active</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm no-scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn(
              "flex gap-2.5 transition-opacity duration-200",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "assistant" && (
              <div className="h-7 w-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Bot className="h-4 w-4" />
              </div>
            )}
            
            <div className="flex flex-col group max-w-[85%]">
              <div
                className={cn(
                  "rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm break-words",
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-[#f8fafc] text-gray-800 rounded-tl-sm border border-gray-100"
                )}
              >
                <FormattedMessage
                  content={msg.content}
                  isUser={msg.role === "user"}
                />
              </div>

              {/* Message metadata & actions */}
              <div className={cn(
                "flex items-center gap-2 mt-1 px-1 text-[11px] text-gray-400",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}>
                {msg.timestamp && <span>{msg.timestamp}</span>}
                {msg.role === "assistant" && (
                  <button
                    onClick={() => handleCopy(msg.content, idx)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-gray-400 hover:text-gray-600"
                    title="Copy message"
                  >
                    {copiedIndex === idx ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {msg.role === "user" && (
              <div className="h-7 w-7 rounded-xl bg-gray-200 text-gray-600 flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-2.5 justify-start">
            <div className="h-7 w-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-[#f8fafc] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm border border-gray-100">
              <span className="text-xs text-gray-500 font-medium mr-1">Zyn is thinking</span>
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}

        {/* Suggestion Chips */}
        {messages.length <= 2 && !isLoading && (
          <div className="pt-2">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Suggested Prompts</p>
            <div className="flex flex-col gap-1.5">
              {quickPrompts
                .filter(p => !p.showIfSelected || selectedEmail)
                .map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(p.prompt)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 hover:bg-blue-50/80 hover:text-blue-700 text-gray-700 text-xs text-left border border-gray-100 hover:border-blue-200 transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <p.icon className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-600 shrink-0" />
                      <span>{p.label}</span>
                    </div>
                    <ArrowRight className="h-3 w-3 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bottom Bar */}
      <div className="p-3 bg-gray-50/80 border-t border-gray-100 shrink-0">
        <div className="relative flex items-center bg-white rounded-xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-sm">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={selectedEmail ? "Ask about this email or inbox..." : "Ask Zyn anything..."}
            className="w-full bg-transparent border-none rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none resize-none max-h-28"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={cn(
              "absolute right-1.5 p-1.5 rounded-lg transition-all flex items-center justify-center",
              input.trim() && !isLoading
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm active:scale-95 cursor-pointer"
                : "text-gray-300 cursor-not-allowed"
            )}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between px-1 mt-1.5 text-[10px] text-gray-400">
          <span>Press Enter ↵ to send</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-blue-500" />
            Private & Secure
          </span>
        </div>
      </div>
    </div>
  );
}
