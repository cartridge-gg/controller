import { useNavigate, useParams } from "react-router-dom";
import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
import {
  ArrowIcon,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@cartridge/ui-next";

export function Asset() {
  const { address, tokenId } = useParams<{
    address: string;
    tokenId: string;
  }>();
  const asset = {
    tokenId,
    name: "Blobert #196",
    description: "Blobert #196 is a squire from Realms World",
    imageUrl: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIG1lZXQiIHN0eWxlPSJpbWFnZS1yZW5kZXJpbmc6IHBpeGVsYXRlZCIgdmlld0JveD0iMCAwIDM1MCAzNTAiPjxpbWFnZSBocmVmPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURBQUFBQXdBUU1BQUFCdHpHdkVBQUFBQmxCTVZFWEdlU2VPVHlsMUNheHpBQUFBRTBsRVFWUVkwMk1ZQlVTQjZQLy9NNGhSQndCclF3TENnQ1d2RmdBQUFBQkpSVTVFcmtKZ2dnPT0iIHg9IjAiIHk9IjAiIHdpZHRoPSIzNTBweCIgaGVpZ2h0PSIzNTBweCIgLz48aW1hZ2UgaHJlZj0iZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFEQUFBQUF3QkFNQUFBQ2xMT1MwQUFBQUcxQk1WRVVBQUFBZkxqaWdJVWI2TWxZT0ZCNWhKRVRyN2V3VkhTdW10TE52azVVQUFBQUFBWFJTVGxNQVFPYllaZ0FBQUtsSlJFRlVPTXZ0emI4S3dqQVF4L0ViNmdPYytLZWpYZ1YzcitCYW1tU1hhQjRnUy9laTRCdjB1VDBxTHNsMWNCUHNsMDczNGRmQWIxUllheHZ0YnJqaVdwR1crY1JjNTRNcnMwdzRtN2hLaDhMTEVmSEJkUXBVeVIyM0pnVkhkRVpweFUwR3ZRcXRRQm14aktaSjNoWVlPaHk2ZXdaSEhHSDVEV3lpZkJxTUpRRHVBeVNRVE41d2dDVG45OXFmWk9MQ3M4ZjFEZktDSjZJZGFCS0lRRzBSWUtKSnVNRGNIL1FDTGlVbHg3WEhkOW9BQUFBQVNVVk9SSzVDWUlJPSIgeD0iMCIgeT0iMCIgd2lkdGg9IjM1MHB4IiBoZWlnaHQ9IjM1MHB4IiAvPjxpbWFnZSBocmVmPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURBQUFBQXdDQU1BQUFCZzNBbTFBQUFBTmxCTVZFVUFBQUFPRkI2dU95OThMVGtsR0NsK1RUOURJakMxZTFaK2xaZkd6YzdaWWpucjdleFBMekhhdDVFMkhpWlViM21PVHlsbE1TdEZMT3U1QUFBQUFYUlNUbE1BUU9iWVpnQUFBT05KUkVGVVNNZnQwZUVTQVNFVWhtR25VMGN0RnZkL3M5NnlqVVhKQmZUNHNTYmZPekVPMHpSTkd4RnBuYUt6MTZKMUtMMjl5OTRQWTdjUTlraUw3UTZkVTVMWURzUWxYc3ZpdmF2enJIOURrQVhzSThtT29CMGNKVFAxSU5FdENIeHkrV3JZaHlNa21ITWt5ZnN0MEJ5VTVqTmdIdVJNd0lnRXp6MEJHb0dVZlFpbXFtWldiakVMQkxuZzhzWS9lczVCL1Nva0tFSDNkN01uVU1OMlN5Umgyc0hWOVFhOVhtTk1KUGdSZUJnUWVaTTgrZ0hrUFRnTjlnU21jRms2Z2FjcXdiaW90T3lIUlUxMHZLY2dlUkgyUTdJelhrUHV0NXZ3V05mMXp5Q3JqNmw0QU1VcUJ6bDdoZzg5QUFBQUFFbEZUa1N1UW1DQyIgeD0iMCIgeT0iMCIgd2lkdGg9IjM1MHB4IiBoZWlnaHQ9IjM1MHB4IiAvPjxpbWFnZSBocmVmPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURBQUFBQXdBZ01BQUFBcWJCRVVBQUFBQ1ZCTVZFVUFBQURyN2V5bXRMTzhPVmMzQUFBQUFYUlNUbE1BUU9iWVpnQUFBQkZKUkVGVUtNOWpHQVVEQmhJWVJoNEFBRjN3QUdHYmhCSEhBQUFBQUVsRlRrU3VRbUNDIiB4PSIwIiB5PSIwIiB3aWR0aD0iMzUwcHgiIGhlaWdodD0iMzUwcHgiIC8+PGltYWdlIGhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBREFBQUFBd0JBTUFBQUNsTE9TMEFBQUFGVkJNVkVVQUFBQU9GQjdIUndCRElqQjhMVG0yZmxxdU95OUFmQ2lsQUFBQUFYUlNUbE1BUU9iWVpnQUFBSDlKUkVGVU9Ndk5rVUVLZ0NBUVJhY2JPRUx0L1RjSUwxRFlCZW9FUWQzL0RLRkNtM0VpUWFpMzlQSDhpNkhYY0VhOGQzTmlNY0wwQ1NhQjNTSnJRVGdBMWpVUnNIQm9JemhTTEJ3c21vZ09ZTUJRS2VFY3lJUlRJTGtYWkdJVXdacndtZ2kxWHczbnFCVzFHNlNPVDZTSXZWb2M1bzhpTkN0MDRSOU8rekVYQ0tnV2xNY2FCVVlBQUFBQVNVVk9SSzVDWUlJPSIgeD0iMCIgeT0iMCIgd2lkdGg9IjM1MHB4IiBoZWlnaHQ9IjM1MHB4IiAvPjwvc3ZnPg==`,
    attributes: [
      { type: "property", name: "Armour", value: "Leather Armour" },
      { type: "property", name: "Mask", value: "Dojo" },
      { type: "property", name: "Background", value: "Orange" },
      { type: "property", name: "Jewelry", value: "Silver Ring" },
      { type: "property", name: "Weapon", value: "Banner of Rage" },
    ],
  };
  const navigate = useNavigate();

  return (
    <LayoutContainer
      left={
        <Button
          variant="icon"
          size="icon"
          onClick={() => {
            navigate(`/collection/${address}`);
          }}
        >
          <ArrowIcon variant="left" />
        </Button>
      }
    >
      <LayoutHeader
        title={asset.name}
        description={asset.tokenId}
        icon={asset.imageUrl}
      />

      <LayoutContent className="pb-4">
        <div className="flex place-content-center">
          <img src={asset.imageUrl} className="w-[60%] rounded-lg" />
        </div>

        <Card>
          <CardHeader className="h-10 flex flex-row items-center justify-between">
            <CardTitle>Properties</CardTitle>
          </CardHeader>

          <CardContent className="bg-background grid grid-cols-2 gap-0.5 p-0">
            {asset.attributes.map((a) => (
              <div
                key={`${a.type}-${a.name}`}
                className="bg-secondary p-3 flex flex-col gap-1"
              >
                <div className="uppercase text-muted-foreground text-2xs font-bold">
                  {a.name}
                </div>
                <div className="text-xs font-medium">{a.value}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </LayoutContent>
    </LayoutContainer>
  );
}
