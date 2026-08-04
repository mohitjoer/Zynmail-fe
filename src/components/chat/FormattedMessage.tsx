import React from "react";
import { cn } from "@/lib/utils";

interface FormattedMessageProps {
  content: string;
  className?: string;
  isUser?: boolean;
}

/**
 * Renders inline markdown tokens: **bold**, `code`, *italic*
 */
function renderInlineMarkdown(text: string, isUser?: boolean): React.ReactNode[] {
  // Regex to match **bold**, __bold__, `code`, *italic*
  const tokenRegex = /(\*\*[\s\S]*?\*\*|__[\s\S]*?__|`[^`]+`|\*[^*]+?\*)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold (**text** or __text__)
    if (
      (part.startsWith("**") && part.endsWith("**") && part.length >= 4) ||
      (part.startsWith("__") && part.endsWith("__") && part.length >= 4)
    ) {
      const inner = part.slice(2, -2);
      return (
        <strong
          key={index}
          className={cn(
            "font-semibold",
            isUser ? "text-white font-bold" : "text-slate-900 font-bold"
          )}
        >
          {inner}
        </strong>
      );
    }

    // Inline code (`text`)
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={index}
          className={cn(
            "px-1.5 py-0.5 mx-0.5 rounded font-mono text-[11px] font-medium inline-block",
            isUser
              ? "bg-white/20 text-white"
              : "bg-slate-200/80 text-indigo-700 border border-slate-300/60"
          )}
        >
          {inner}
        </code>
      );
    }

    // Italic (*text*)
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <em key={index} className="italic">
          {inner}
        </em>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

/**
 * High-performance FormattedMessage component that properly renders
 * Markdown paragraphs, bold text (**word**), bullet lists, and code in chat.
 */
export function FormattedMessage({
  content,
  className,
  isUser = false,
}: FormattedMessageProps) {
  if (!content) return null;

  // Split into paragraphs / lines
  const lines = content.split("\n");

  return (
    <div className={cn("space-y-2 text-xs leading-relaxed break-words font-sans", className)}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        // Bullet point line (- or * or •)
        if (
          trimmed.startsWith("- ") ||
          trimmed.startsWith("* ") ||
          trimmed.startsWith("• ")
        ) {
          const bulletContent = trimmed.replace(/^[-*•]\s+/, "");
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full mt-1.5 shrink-0",
                  isUser ? "bg-white/80" : "bg-indigo-500"
                )}
              />
              <span className="flex-1">
                {renderInlineMarkdown(bulletContent, isUser)}
              </span>
            </div>
          );
        }

        // Numbered list item (e.g. "1. ")
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          const num = numberedMatch[1];
          const numContent = numberedMatch[2];
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span
                className={cn(
                  "text-[10px] font-mono font-bold mt-0.5 shrink-0",
                  isUser ? "text-white/80" : "text-indigo-600"
                )}
              >
                {num}.
              </span>
              <span className="flex-1">
                {renderInlineMarkdown(numContent, isUser)}
              </span>
            </div>
          );
        }

        // Standard paragraph line
        return (
          <p key={lineIdx} className="my-0">
            {renderInlineMarkdown(line, isUser)}
          </p>
        );
      })}
    </div>
  );
}

export default FormattedMessage;
