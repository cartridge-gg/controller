import { LocationGateOptions } from "@cartridge/controller";

export function createLocationGateUrl({
  returnTo,
  gate,
}: {
  returnTo: string;
  gate: LocationGateOptions;
}) {
  const params = new URLSearchParams();
  params.set("returnTo", returnTo);
  params.set("gate", JSON.stringify(gate));
  return `/location-gate?${params.toString()}`;
}
