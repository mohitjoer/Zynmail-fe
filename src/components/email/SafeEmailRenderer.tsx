
"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import DOMPurify from "dompurify";
import { Shield, Image as ImageIcon, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

interface SafeEmailRendererProps {
  htmlContent?: string;
  plainText?: string;
  className?: string;
}

// Transparent 1x1 SVG placeholder for blocked images
const PLACEHOLDER_SVG =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E";

export default function SafeEmailRenderer({
  htmlContent,
  plainText,
  className = "",
}: SafeEmailRendererProps) {
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState<number>(400);
  const [allowRemoteImages, setAllowRemoteImages] = useState<boolean>(false);

  // Detect if the raw HTML contains remote HTTP/HTTPS images
  const hasRemoteImages = useMemo(() => {
    if (!htmlContent) return false;
    return /<img[^>]+src=["'](https?:\/\/[^"']+)["']/i.test(htmlContent);
  }, [htmlContent]);

  // Double Sanitization pass with DOMPurify + Safe URI and Link enforcement
  const sanitizedHtml = useMemo(() => {
    if (!htmlContent) return "";

    // Configure DOMPurify
    const clean = DOMPurify.sanitize(htmlContent, {
      FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "base"],
      FORBID_ATTR: [
        "onerror",
        "onload",
        "onclick",
        "onmouseover",
        "onfocus",
        "onblur",
        "onchange",
        "onsubmit",
        "onkeydown",
      ],
      ALLOWED_URI_REGEXP:
        /^(?:(?:https?|mailto|data|cid):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      ADD_ATTR: ["target", "rel"],
    });

    // Force links to open safely in a new tab
    let processed = clean.replace(
      /<a\s+(?!.*?target=)([^>]+)>/gi,
      '<a target="_blank" rel="noopener noreferrer" $1>'
    );
    processed = processed.replace(
      /<a\s+(?=[^>]*target=)([^>]+)>/gi,
      (match) => {
        if (!match.includes('rel=')) {
          return match.replace(/<a\s+/i, '<a rel="noopener noreferrer" ');
        }
        return match;
      }
    );

    // If remote images are blocked, replace their src with a placeholder
    if (hasRemoteImages && !allowRemoteImages) {
      processed = processed.replace(
        /<img([^>]*)\ssrc=["'](https?:\/\/[^"']+)["']([^>]*)>/gi,
        `<img$1 src="${PLACEHOLDER_SVG}" data-zyn-src="$2"$3 style="border: 1px dashed rgba(128,128,128,0.3); border-radius: 4px; min-height: 24px; min-width: 24px;" title="Image blocked for privacy" />`
      );
    }

    return processed;
  }, [htmlContent, hasRemoteImages, allowRemoteImages]);

  // Construct complete isolated srcDoc with sandboxed style defaults
  const srcDoc = useMemo(() => {
    if (!sanitizedHtml) return "";

    const isDark = theme === "dark";
    const textColor = isDark ? "#e2e8f0" : "#1e293b";
    const linkColor = isDark ? "#818cf8" : "#4f46e5";
    const bgColor = isDark ? "transparent" : "#ffffff";

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <base target="_blank" />
  <style>
    :root {
      color-scheme: ${isDark ? "dark" : "light"};
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 16px 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: ${textColor};
      background-color: ${bgColor};
      word-break: break-word;
      overflow-wrap: break-word;
      overflow-x: hidden;
    }
    img {
      max-width: 100% !important;
      height: auto !important;
    }
    table {
      max-width: 100% !important;
    }
    a {
      color: ${linkColor};
      text-decoration: underline;
    }
    a:hover {
      text-decoration: none;
    }
    blockquote {
      margin: 12px 0;
      padding-left: 14px;
      border-left: 3px solid ${isDark ? "#475569" : "#cbd5e1"};
      color: ${isDark ? "#94a3b8" : "#64748b"};
    }
    pre, code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      background: ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"};
      border-radius: 4px;
      padding: 2px 5px;
    }
  </style>
</head>
<body>
  ${sanitizedHtml}
</body>
</html>`;
  }, [sanitizedHtml, theme]);

  // Dynamic Height calculation without allow-scripts using parent-side ResizeObserver
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let resizeObserver: ResizeObserver | null = null;

    const handleResize = () => {
      try {
        if (iframe.contentDocument?.body) {
          const scrollHeight = iframe.contentDocument.body.scrollHeight;
          const offsetHeight = iframe.contentDocument.body.offsetHeight;
          const newHeight = Math.max(scrollHeight, offsetHeight, 150) + 24;
          setIframeHeight(newHeight);
        }
      } catch (e) {
        // Cross-origin fallback (should not occur since srcDoc is same-origin)
      }
    };

    const attachObserver = () => {
      try {
        if (iframe.contentDocument?.body) {
          handleResize();
          resizeObserver = new ResizeObserver(() => {
            handleResize();
          });
          resizeObserver.observe(iframe.contentDocument.body);

          // Handle link click events to ensure safe external opening
          iframe.contentDocument.addEventListener("click", (e: MouseEvent) => {
            const target = (e.target as HTMLElement)?.closest("a");
            if (target && target.href) {
              e.preventDefault();
              window.open(target.href, "_blank", "noopener,noreferrer");
            }
          });
        }
      } catch (err) {
        console.warn("Could not attach observer to iframe", err);
      }
    };

    iframe.addEventListener("load", attachObserver);
    if (iframe.contentDocument?.readyState === "complete") {
      attachObserver();
    }

    return () => {
      iframe.removeEventListener("load", attachObserver);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [srcDoc]);

  // If no HTML body is provided, render safe plain text
  if (!htmlContent) {
    return (
      <div className={`whitespace-pre-wrap text-sm text-foreground leading-relaxed ${className}`}>
        {plainText || "(No content)"}
      </div>
    );
  }

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {/* Remote Image Privacy Notice Banner */}
      {hasRemoteImages && !allowRemoteImages && (
        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 mb-3 rounded-lg bg-muted/60 border border-border text-xs text-muted-foreground transition-all">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-500 shrink-0" />
            <span>
              Remote images are blocked to protect your privacy and prevent sender tracking.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAllowRemoteImages(true)}
            className="h-7 px-2.5 text-xs font-medium gap-1.5 shrink-0 border-border hover:bg-accent"
          >
            <Eye className="h-3.5 w-3.5 text-primary" />
            <span>Load Images</span>
          </Button>
        </div>
      )}

      {/* Sandboxed Iframe */}
      <div className="relative w-full rounded-md border border-border/60 bg-card overflow-hidden shadow-xs">
        <iframe
          ref={iframeRef}
          srcDoc={srcDoc}
          sandbox="allow-same-origin"
          title="Email Message Content"
          className="w-full border-none transition-all"
          style={{
            height: `${iframeHeight}px`,
            width: "100%",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}
