import { useAdvancedView, useFeatures } from "@/hooks/features";
import { Switch } from "@cartridge/controller-ui";
import { useCallback } from "react";

export function AdvancedViewSection() {
  const advancedView = useAdvancedView();
  const { enableFeature, disableFeature } = useFeatures();

  const handleCheckedChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        enableFeature("advanced-view");
      } else {
        disableFeature("advanced-view");
      }
    },
    [disableFeature, enableFeature],
  );

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <label
            className="text-foreground-200 text-sm font-medium"
            htmlFor="advanced-view"
          >
            Advanced view
          </label>
          <p
            className="text-foreground-300 text-xs font-normal"
            id="advanced-view-description"
          >
            Show network details, addresses, transaction data, and explorer
            links.
          </p>
        </div>
        <Switch
          aria-describedby="advanced-view-description"
          checked={advancedView}
          id="advanced-view"
          onCheckedChange={handleCheckedChange}
        />
      </div>
    </section>
  );
}
