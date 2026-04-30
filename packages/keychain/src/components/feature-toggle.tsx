import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  GearIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/controller-ui";
import { Feature, useFeatures } from "@/hooks/features";

type FeatureParams = {
  name: Feature;
  action: "enable" | "disable" | string;
};

export function FeatureToggle() {
  const { name, action } = useParams<FeatureParams>();
  const { features, enableFeature, disableFeature } = useFeatures();
  const navigate = useNavigate();

  const isValidAction = action === "enable" || action === "disable";

  useEffect(() => {
    if (!name) {
      console.error("Feature name missing in URL.");
      return;
    }

    if (action === "enable") {
      enableFeature(name);
    } else if (action === "disable") {
      disableFeature(name);
    } else {
      console.error(`Invalid action '${action}' for feature '${name}'.`);
    }
  }, [name, action, enableFeature, disableFeature]);

  const enabledFeatures = useMemo(
    () =>
      Object.entries(features)
        .filter(([, enabled]) => enabled)
        .map(([feature]) => feature),
    [features],
  );

  const title = !name ? (
    "Missing feature"
  ) : !isValidAction ? (
    <>
      Invalid action <Badge variant="primary">{action}</Badge>
    </>
  ) : action === "enable" ? (
    <>
      Enabled <Badge variant="primary">{name}</Badge>
    </>
  ) : (
    <>
      Disabled <Badge variant="primary">{name}</Badge>
    </>
  );

  const description = !name
    ? "No feature name was provided in the URL."
    : !isValidAction
      ? `Use 'enable' or 'disable' to toggle '${name}'.`
      : "Feature preference saved.";

  return (
    <>
      <HeaderInner Icon={GearIcon} title={title} description={description} />
      <LayoutContent>
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase text-foreground-400">
            Enabled features
          </p>
          {enabledFeatures.length === 0 ? (
            <p className="text-sm text-foreground-300">
              No features are currently enabled.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {enabledFeatures.map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1 rounded-full bg-background-200 border border-background-300 text-sm text-foreground-200"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>
      </LayoutContent>
      <LayoutFooter>
        <Button variant="secondary" onClick={() => navigate("/")}>
          Back
        </Button>
      </LayoutFooter>
    </>
  );
}
