import React, { useMemo } from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
  displayMode?: boolean;
}

/**
 * Parses a string and renders LaTeX mathematical expressions cleanly.
 * Strictly uses output: 'html' to prevent duplicate MathML text rendering.
 */
export const MathText: React.FC<MathTextProps> = ({ text, className = '', displayMode = false }) => {
  const renderedContent = useMemo(() => {
    if (!text) return '';

    // Regex to detect explicit LaTeX math enclosed in $...$ or $$...$$
    const mathRegex = /(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g;
    const parts: React.ReactNode[] = [];

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = mathRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      // Add plain text before the math expression
      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex));
      }

      const rawMatch = match[0];
      const isDisplay = rawMatch.startsWith('$$');
      const mathCode = isDisplay
        ? rawMatch.slice(2, -2).trim()
        : rawMatch.slice(1, -1).trim();

      try {
        // Crucial: output: 'html' outputs ONLY the visual HTML representation,
        // completely skipping the MathML layer that caused double equations.
        const html = katex.renderToString(mathCode, {
          displayMode: displayMode || isDisplay,
          output: 'html',
          throwOnError: false,
        });

        parts.push(
          <span
            key={`math-${matchIndex}`}
            className="inline-math inline-block align-baseline px-0.5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch (err) {
        console.warn('KaTeX render error:', err);
        parts.push(rawMatch);
      }

      lastIndex = matchIndex + rawMatch.length;
    }

    // Add trailing plain text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  }, [text, displayMode]);

  return <span className={`math-text-container ${className}`}>{renderedContent}</span>;
};
