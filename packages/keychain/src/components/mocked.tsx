import { Button } from "@cartridge/ui";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export function Mocked({
  title,
  setSearchParams,
}: {
  title: string;
  setSearchParams: (searchParams: URLSearchParams) => void;
}) {
  const [searchParams] = useSearchParams();

  const searchParamsObj = useMemo(() => {
    const p: Record<string, string> = {};
    for (const [key, val] of searchParams.entries()) {
      p[key] = decodeURIComponent(val);
    }
    return p;
  }, [searchParams]);

  const onClick = useCallback(() => {
    const callbackUrl = decodeURIComponent(searchParams.get("callback_uri")!);
    if (!callbackUrl) {
      throw new Error("callback_uri is required");
    }
    const url = new URL(callbackUrl);
    setSearchParams(url.searchParams);

    window.location.href = url.toString();
  }, [searchParams, setSearchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 gap-2">
      <div className="w-full flex flex-col gap-2">
        <div className="text-sm font-bold">Search params:</div>
        <pre className="w-full overflow-x-auto border border-foreground-400 rounded p-2">
          <code>{JSON.stringify(searchParamsObj, null, 2)}</code>
        </pre>
      </div>

      <Button onClick={onClick}>{title}</Button>
    </div>
  );
}
