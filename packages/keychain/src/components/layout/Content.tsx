import { useLayout } from "./Container";

export function Content({ children, className = "", ...props }: { children: React.ReactNode; className?: string }) {
  const { footer } = useLayout();

  return (
    <div className={`w-full px-4 pb-[${footer.height}px] flex flex-col items-stretch gap-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
