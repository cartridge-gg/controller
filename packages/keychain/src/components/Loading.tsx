import { Spinner } from "@cartridge/ui";

export function PageLoading() {
  return (
    <div className="h-dvh flex items-center justify-center">
      <Spinner size="xl" />
    </div>
  );
}
