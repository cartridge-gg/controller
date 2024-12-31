import { Spinner } from "@cartridge/ui-next";

export function PageLoading() {
  return (
    <div className="h-screen flex items-center justify-center">
      <Spinner size="xl" />
    </div>
  );
}
