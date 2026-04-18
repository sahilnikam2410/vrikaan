/**
 * Minimal markdown-to-JSX renderer for short Gemini/LLM output.
 * Handles: **bold**, *italic*, bullet lists (`* ` or `- `), numbered lists
 * (`1. `), and preserves paragraph breaks. Intentionally tiny — we don't
 * need a full CommonMark parser for a 180-word AI summary.
 */

function renderInline(text) {
  // Split on bold (**text**) and italics (*text* or _text_), keeping delimiters.
  const parts = [];
  let remaining = text;
  let key = 0;
  const rx = /(\*\*[^*]+\*\*|\*[^*\n]+\*|_[^_\n]+_|`[^`\n]+`)/g;
  let lastIdx = 0;
  let match;
  while ((match = rx.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      parts.push(
        <code
          key={key++}
          style={{
            background: "rgba(20,227,197,0.08)",
            padding: "1px 5px",
            borderRadius: 4,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.9em",
          }}
        >
          {token.slice(1, -1)}
        </code>
      );
    } else {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    lastIdx = match.index + token.length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts.length ? parts : [text];
}

export default function renderMarkdown(source) {
  if (!source) return null;
  const lines = String(source).replace(/\r\n/g, "\n").split("\n");

  const blocks = [];
  let currentList = null; // { type: 'ul' | 'ol', items: [] }
  let paragraphBuffer = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length) {
      blocks.push({ type: "p", text: paragraphBuffer.join(" ") });
      paragraphBuffer = [];
    }
  };
  const flushList = () => {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    const bullet = /^[*\-•]\s+(.*)$/.exec(line);
    const numbered = /^(\d+)\.\s+(.*)$/.exec(line);
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);

    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h", level: heading[1].length, text: heading[2] });
    } else if (bullet) {
      flushParagraph();
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(bullet[1]);
    } else if (numbered) {
      flushParagraph();
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(numbered[2]);
    } else {
      flushList();
      paragraphBuffer.push(line);
    }
  }
  flushParagraph();
  flushList();

  return blocks.map((block, i) => {
    if (block.type === "h") {
      const size = Math.max(12, 20 - (block.level - 1) * 2);
      return (
        <div
          key={i}
          style={{ fontSize: size, fontWeight: 700, margin: "10px 0 6px", color: "#ffffff" }}
        >
          {renderInline(block.text)}
        </div>
      );
    }
    if (block.type === "ul") {
      return (
        <ul key={i} style={{ margin: "6px 0 6px 18px", padding: 0 }}>
          {block.items.map((item, j) => (
            <li key={j} style={{ marginBottom: 4 }}>
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
    }
    if (block.type === "ol") {
      return (
        <ol key={i} style={{ margin: "6px 0 6px 20px", padding: 0 }}>
          {block.items.map((item, j) => (
            <li key={j} style={{ marginBottom: 4 }}>
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
    }
    return (
      <p key={i} style={{ margin: "6px 0" }}>
        {renderInline(block.text)}
      </p>
    );
  });
}
