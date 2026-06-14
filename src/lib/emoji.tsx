import React from 'react';

// Helper to convert emoji character to its unified code point hex string
export const emojiToUnified = (emoji: string): string => {
  const codePoints: string[] = [];
  for (const char of emoji) {
    const cp = char.codePointAt(0);
    if (cp) {
      codePoints.push(cp.toString(16));
    }
  }
  
  // Clean code points to match emoji-datasource-apple names:
  // 1. Strip standard text-style variation selector 'fe0f' for basic single emojis
  // 2. Keep it for multi-character sequences (like zero-width joiner sequences) if needed
  if (codePoints.includes('fe0f')) {
    return codePoints.filter(cp => cp !== 'fe0f').join('-');
  }
  
  return codePoints.join('-');
};

// Reusable function to parse a text string and return a list of React nodes
// where all standard emojis are replaced by high-res Apple-styled SVG/PNG images.
export const replaceEmojis = (text: string): React.ReactNode[] => {
  if (!text) return [];
  
  // Use Emoji_Presentation property to match standard emojis
  const regex = /(\p{Emoji_Presentation})/gu;
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    if (part.match(regex)) {
      const hex = emojiToUnified(part);
      return (
        <img
          key={index}
          src={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${hex}.png`}
          alt={part}
          className="w-[1.2em] h-[1.2em] inline-block align-text-bottom select-none mx-[0.05em]"
          onError={(e) => {
            // Fallback: hide broken image and render text representation of the emoji
            (e.target as HTMLImageElement).style.display = 'none';
            const textNode = document.createTextNode(part);
            (e.target as HTMLImageElement).parentNode?.insertBefore(textNode, e.target as HTMLImageElement);
          }}
        />
      );
    }
    return part;
  });
};

interface AppleEmojiProps {
  text: string;
  className?: string;
}

export const AppleEmoji: React.FC<AppleEmojiProps> = ({ text, className }) => {
  return <span className={className}>{replaceEmojis(text)}</span>;
};
