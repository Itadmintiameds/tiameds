import { createElement, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from 'react';

export type RevealType = 'up' | 'fade' | 'scale' | 'clip' | 'line';

export interface RevealProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  type?: RevealType;
  /** Delay in ms (also usable for staggering lists). */
  delay?: number;
  children?: ReactNode;
  href?: string;
}

/**
 * Scroll reveal without per-element client code: renders the element with [data-reveal];
 * RevealController adds `.is-in` when it enters the viewport and CSS does the motion.
 */
export default function Reveal({ as = 'div', type = 'up', delay = 0, style, children, ...rest }: RevealProps) {
  const merged: CSSProperties = delay ? { ...style, ['--d' as string]: `${delay}ms` } : { ...style };
  return createElement(as, { ...rest, style: merged, 'data-reveal': type === 'fade' ? '' : type }, children);
}
