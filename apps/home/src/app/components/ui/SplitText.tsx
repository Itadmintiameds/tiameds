import { createElement, Fragment, type CSSProperties, type ElementType, type ReactNode } from 'react';

export interface SplitTextProps {
  /**
   * Text to reveal word by word. Wrap words in *asterisks* to set them in the serif italic accent;
   * use a newline to force a line break.
   */
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  id?: string;
}

/** Masked word-by-word heading reveal (server rendered; motion handled by CSS + RevealController). */
export default function SplitText({ text, as = 'h2', className = '', delay = 0, id }: SplitTextProps) {
  let wordIndex = 0;
  const lines = text.split('\n');

  const content: ReactNode[] = lines.map((line, lineIdx) => {
    const tokens = line.split(/(\*[^*]+\*)/g).filter(Boolean);
    const parts: ReactNode[] = [];
    tokens.forEach((token, tIdx) => {
      const isEm = token.length > 2 && token.startsWith('*') && token.endsWith('*');
      const raw = isEm ? token.slice(1, -1) : token;
      raw.split(/(\s+)/).forEach((piece, pIdx) => {
        if (!piece) return;
        if (/^\s+$/.test(piece)) {
          parts.push(<Fragment key={`s-${lineIdx}-${tIdx}-${pIdx}`}> </Fragment>);
          return;
        }
        const i = wordIndex++;
        parts.push(
          <span key={`w-${lineIdx}-${tIdx}-${pIdx}`} className={isEm ? 'w w-em' : 'w'}>
            <span className={isEm ? 'wi em' : 'wi'} style={{ ['--i' as string]: i } as CSSProperties}>
              {piece}
            </span>
          </span>,
        );
      });
    });
    return (
      <Fragment key={`l-${lineIdx}`}>
        {lineIdx > 0 && <br />}
        {parts}
      </Fragment>
    );
  });

  const style: CSSProperties | undefined = delay ? { ['--d' as string]: `${delay}ms` } : undefined;
  return createElement(as, { id, className: `split ${className}`, 'data-reveal': 'split', style }, content);
}
