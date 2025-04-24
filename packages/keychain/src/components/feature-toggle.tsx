import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFeatures } from "@/hooks/features";

type FeatureParams = {
  name: string;
  action: "enable" | "disable" | string; // Allow string initially for validation
};

export function FeatureToggle() {
  const { name, action } = useParams<FeatureParams>();
  const { enableFeature, disableFeature } = useFeatures();
  const navigate = useNavigate();

  useEffect(() => {
    if (!name) {
      console.error("Feature name missing in URL.");
      navigate("/"); // Redirect to home or an error page
      return;
    }

    if (action === "enable") {
      enableFeature(name);
      console.log(`Feature '${name}' enabled.`);
    } else if (action === "disable") {
      disableFeature(name);
      console.log(`Feature '${name}' disabled.`);
    } else {
      console.error(`Invalid action '${action}' for feature '${name}'.`);
      // Optionally navigate away or show an error message
    }

    // Redirect to home page after toggling
    // Consider showing a success message briefly before redirecting
    const timer = setTimeout(() => {
      navigate("/");
    }, 1000); // Redirect after 1 second

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [name, action, enableFeature, disableFeature, navigate]);

  // Display a message while processing/redirecting
  return (
    <div>
      Updating feature '{name}' to '{action}' state... Redirecting soon.
    </div>
  );
}
