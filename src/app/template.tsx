/**
 * template.tsx — disabled page transitions to prevent global-error crash.
 * The AnimatePresence in PageTransition was causing hydration errors.
 * Re-enable later by wrapping children with <PageTransition>.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
