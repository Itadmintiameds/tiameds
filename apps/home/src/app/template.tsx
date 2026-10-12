// Re-mounts on every navigation, so each page fades in softly (disabled under reduced motion via CSS).
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
