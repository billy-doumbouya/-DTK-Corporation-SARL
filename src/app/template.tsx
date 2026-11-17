import type { Metadata } from "next";
import { PageTransition } from "@/components/site/page-transition";

export const metadata: Metadata = {
  title: "DTK Corporation SARL",
};

/**
 * template.tsx re-renders on every navigation, enabling page transitions.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
