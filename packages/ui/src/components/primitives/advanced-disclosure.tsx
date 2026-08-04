import { useAdvancedView } from "../../hooks/ui";
import type { AnchorHTMLAttributes, ReactNode } from "react";

export interface AdvancedDetailsProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdvancedDetails({
  children,
  fallback = null,
}: AdvancedDetailsProps) {
  const advancedView = useAdvancedView();

  return <>{advancedView ? children : fallback}</>;
}

export interface AdvancedLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href?: string | null;
  fallback?: ReactNode;
}

export function AdvancedLink({
  href,
  children,
  fallback = children,
  ...anchorProps
}: AdvancedLinkProps) {
  const advancedView = useAdvancedView();
  const normalizedHref = href?.trim();
  const hasValidHref = Boolean(normalizedHref) && normalizedHref !== "#";

  if (!advancedView || !hasValidHref) return <>{fallback}</>;

  return (
    <a href={normalizedHref} {...anchorProps}>
      {children}
    </a>
  );
}
