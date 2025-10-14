import React, { HTMLAttributes } from "react";

interface HighlightedTextProps {
  text: string;
  query: string;
  highlightClassName?: string;
  defaultClassName?: string;
}

/**
 * Highlights matching text in a string with different styles
 * @param text - The text to search and highlight in
 * @param query - The search query to highlight
 * @param highlightClassName - CSS class for highlighted text (default: "text-foreground-100")
 * @param defaultClassName - CSS class for non-highlighted text (default: "text-foreground-300")
 */
export const HighlightedText = React.forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement> & HighlightedTextProps
>(
  (
    {
      text,
      query,
      highlightClassName = "text-foreground-100",
      defaultClassName = "text-foreground-300",
    },
    ref,
  ) => {
    if (!query || !text) {
      return <span className={defaultClassName}>{text}</span>;
    }

    // Escape special regex characters in the query
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Create case-insensitive regex to find matches
    const regex = new RegExp(`(${escapedQuery})`, "gi");

    // Split the text by matches, keeping the delimiters
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, index) => {
          // Check if this part matches the query (case-insensitive)
          const isMatch = part.toLowerCase() === query.toLowerCase();

          return (
            <span
              key={index}
              ref={ref}
              className={isMatch ? highlightClassName : defaultClassName}
            >
              {part}
            </span>
          );
        })}
      </>
    );
  },
);

HighlightedText.displayName = "HighlightedText";
