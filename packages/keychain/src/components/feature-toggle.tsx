import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFeatures } from "@/hooks/features";

export function FeatureToggle() {
  const { name, action } = useLocalSearchParams<{
    name: string;
    action: string;
  }>();
  const { enableFeature, disableFeature } = useFeatures();
  const router = useRouter();

  useEffect(() => {
    if (!name) {
      console.error("Feature name missing in URL.");
      router.push("/"); // Redirect to home or an error page
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
      router.push("/");
    }, 1000); // Redirect after 1 second

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [name, action, enableFeature, disableFeature, router]);

  // Display a message while processing/redirecting
  return (
    <div>
      Updating feature '{name}' to '{action}' state... Redirecting soon.
    </div>
  );
}
