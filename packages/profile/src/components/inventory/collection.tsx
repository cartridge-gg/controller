import { useParams, Link, useSearchParams } from "react-router-dom";
import {
  ArrowIcon,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CheckboxIcon,
  cn,
  CopyAddress,
} from "@cartridge/ui-next";
import {
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from "@/components/layout";

export function Collection() {
  const { address } = useParams<{ address: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const c = {
    address,
    name: "Blobert",
    totalCount: 9,
    imageUrl: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIG1lZXQiIHN0eWxlPSJpbWFnZS1yZW5kZXJpbmc6IHBpeGVsYXRlZCIgdmlld0JveD0iMCAwIDM1MCAzNTAiPjxpbWFnZSBocmVmPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURBQUFBQXdBUU1BQUFCdHpHdkVBQUFBQmxCTVZFWEdlU2VPVHlsMUNheHpBQUFBRTBsRVFWUVkwMk1ZQlVTQjZQLy9NNGhSQndCclF3TENnQ1d2RmdBQUFBQkpSVTVFcmtKZ2dnPT0iIHg9IjAiIHk9IjAiIHdpZHRoPSIzNTBweCIgaGVpZ2h0PSIzNTBweCIgLz48aW1hZ2UgaHJlZj0iZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFEQUFBQUF3QkFNQUFBQ2xMT1MwQUFBQUcxQk1WRVVBQUFBZkxqaWdJVWI2TWxZT0ZCNWhKRVRyN2V3VkhTdW10TE52azVVQUFBQUFBWFJTVGxNQVFPYllaZ0FBQUtsSlJFRlVPTXZ0emI4S3dqQVF4L0ViNmdPYytLZWpYZ1YzcitCYW1tU1hhQjRnUy9laTRCdjB1VDBxTHNsMWNCUHNsMDczNGRmQWIxUllheHZ0YnJqaVdwR1crY1JjNTRNcnMwdzRtN2hLaDhMTEVmSEJkUXBVeVIyM0pnVkhkRVpweFUwR3ZRcXRRQm14aktaSjNoWVlPaHk2ZXdaSEhHSDVEV3lpZkJxTUpRRHVBeVNRVE41d2dDVG45OXFmWk9MQ3M4ZjFEZktDSjZJZGFCS0lRRzBSWUtKSnVNRGNIL1FDTGlVbHg3WEhkOW9BQUFBQVNVVk9SSzVDWUlJPSIgeD0iMCIgeT0iMCIgd2lkdGg9IjM1MHB4IiBoZWlnaHQ9IjM1MHB4IiAvPjxpbWFnZSBocmVmPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURBQUFBQXdDQU1BQUFCZzNBbTFBQUFBTmxCTVZFVUFBQUFPRkI2dU95OThMVGtsR0NsK1RUOURJakMxZTFaK2xaZkd6YzdaWWpucjdleFBMekhhdDVFMkhpWlViM21PVHlsbE1TdEZMT3U1QUFBQUFYUlNUbE1BUU9iWVpnQUFBT05KUkVGVVNNZnQwZUVTQVNFVWhtR25VMGN0RnZkL3M5NnlqVVhKQmZUNHNTYmZPekVPMHpSTkd4RnBuYUt6MTZKMUtMMjl5OTRQWTdjUTlraUw3UTZkVTVMWURzUWxYc3ZpdmF2enJIOURrQVhzSThtT29CMGNKVFAxSU5FdENIeHkrV3JZaHlNa21ITWt5ZnN0MEJ5VTVqTmdIdVJNd0lnRXp6MEJHb0dVZlFpbXFtWldiakVMQkxuZzhzWS9lczVCL1Nva0tFSDNkN01uVU1OMlN5Umgyc0hWOVFhOVhtTk1KUGdSZUJnUWVaTTgrZ0hrUFRnTjlnU21jRms2Z2FjcXdiaW90T3lIUlUxMHZLY2dlUkgyUTdJelhrUHV0NXZ3V05mMXp5Q3JqNmw0QU1VcUJ6bDdoZzg5QUFBQUFFbEZUa1N1UW1DQyIgeD0iMCIgeT0iMCIgd2lkdGg9IjM1MHB4IiBoZWlnaHQ9IjM1MHB4IiAvPjxpbWFnZSBocmVmPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURBQUFBQXdBZ01BQUFBcWJCRVVBQUFBQ1ZCTVZFVUFBQURyN2V5bXRMTzhPVmMzQUFBQUFYUlNUbE1BUU9iWVpnQUFBQkZKUkVGVUtNOWpHQVVEQmhJWVJoNEFBRjN3QUdHYmhCSEhBQUFBQUVsRlRrU3VRbUNDIiB4PSIwIiB5PSIwIiB3aWR0aD0iMzUwcHgiIGhlaWdodD0iMzUwcHgiIC8+PGltYWdlIGhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBREFBQUFBd0JBTUFBQUNsTE9TMEFBQUFGVkJNVkVVQUFBQU9GQjdIUndCRElqQjhMVG0yZmxxdU95OUFmQ2lsQUFBQUFYUlNUbE1BUU9iWVpnQUFBSDlKUkVGVU9Ndk5rVUVLZ0NBUVJhY2JPRUx0L1RjSUwxRFlCZW9FUWQzL0RLRkNtM0VpUWFpMzlQSDhpNkhYY0VhOGQzTmlNY0wwQ1NhQjNTSnJRVGdBMWpVUnNIQm9JemhTTEJ3c21vZ09ZTUJRS2VFY3lJUlRJTGtYWkdJVXdacndtZ2kxWHczbnFCVzFHNlNPVDZTSXZWb2M1bzhpTkN0MDRSOU8rekVYQ0tnV2xNY2FCVVlBQUFBQVNVVk9SSzVDWUlJPSIgeD0iMCIgeT0iMCIgd2lkdGg9IjM1MHB4IiBoZWlnaHQ9IjM1MHB4IiAvPjwvc3ZnPg==`,
    assets: [
      {
        tokenId: "46",
        name: "Blobert #46",
        imageUrl: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIG1lZXQiIHN0eWxlPSJpbWFnZS1yZW5kZXJpbmc6IHBpeGVsYXRlZCIgdmlld0JveD0iMCAwIDM1MCAzNTAiPjxpbWFnZSBocmVmPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURBQUFBQXdBZ01BQUFBcWJCRVVBQUFBQ1ZCTVZFWHI3ZXdCcmJYR3pjNFpPSkJKQUFBQWcwbEVRVlFvejMzTndRMURJUXdEVURoa0JKYm9GSXlRU25oSnBpeXBnYnF0d0tmLzlIR2MvbUlWUUpzb1Q0eU1qOTRYcXNJSnE0RkdzS2l3SHpEeXJPQWRBb3dIOGtRTjJFUUtyQXJ4ZGRPUGFBcU1MQmhIbUJ6WXZiV2lwUjFUNUNNTXVnTTkxaFN1cU5wSmx6eDZ2Nks0QU8yRERBaTg3QjdCUDFjQWg5TTZxbmtCZnh4UTRkMEphMndBQUFBQVNVVk9SSzVDWUlJPSIgeD0iMCIgeT0iMCIgd2lkdGg9IjM1MHB4IiBoZWlnaHQ9IjM1MHB4IiAvPjxpbWFnZSBocmVmPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURBQUFBQXdCQU1BQUFDbExPUzBBQUFBSjFCTVZFVUFBQUFWSFNzT0ZCN2F0NUU0U1ZFZkxqaFViM2wrbFpmalVpYTFlMWJHemM3cjdleCtUVDhlaGd4VEFBQUFBWFJTVGxNQVFPYllaZ0FBQUxsSlJFRlVPTXZ0MExFS3dqQVFnT0hnNXVZVnU3ZXhndnVCRkxmQ1llZUMwUmNvMlNXMm9xdExSaDA3bGdydXZvVDRWdHExdVlLam9EK1o4bkhEbmZqMnBKUUIrMDg3OEJnWkVLVUplQzVFT3FldGdzQVpXR3BOdGNxOGp5RWluYmNBZ1FOcFNmVllPekNsdzJOZjZtZlNnWUZQNWo1NVB4NlFnNVhCTmhlVVFXdFBMTVJTempoWXg5YmFlZFlGOE5VUmNWRTRlNFRnYnhxOEtYQnVGWUpxOEpxTmhOUEZOMWlBWUtvcVJNRTJyRVJQdlhBVy8zNmdGL3BSTWFOSWl5VmRBQUFBQUVsRlRrU3VRbUNDIiB4PSIwIiB5PSIwIiB3aWR0aD0iMzUwcHgiIGhlaWdodD0iMzUwcHgiIC8+PGltYWdlIGhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBREFBQUFBd0JBTUFBQUNsTE9TMEFBQUFJVkJNVkVVQUFBRDZNbGFnSVVZT0ZCNWhKRVIrVFQrMWUxYmF0NUUySGlhT1R5bGxNU3ZMdU4rcEFBQUFBWFJTVGxNQVFPYllaZ0FBQU5kSlJFRlVPTXZ0ajhFTndqQVFCQzFvZ0QwYTRBNFhFSEpCNGgxU0FZZ1VBQThLb0FuK1ZFR1hyQlVJc2VEQmswZldrblhhOFdwOVlkU29YK1hGY3lpTHpKL2FjalY3RGhrb3pRd0xEcXJMSWd0QVRDV0VDZFI4R0ZEQWhCRVZTT2tEQU13SlpJSUV6djFQcGp1QUlTVlFUcWYyOGdLdHptdEZkN0Erdk1IK1dKbENtQUhnaC9iVXIrZDFBZ0lDY2U4N21Lbk5BSU1TRlBubUJGMkZmUURhZ3ErZ3E0ZzVhRWdFK2dXd3ZTWVFhekpRTlExQnBCOEpoZ0VxV2pUNlErQVYvYTBuVlFUWmUvcjNXOWhjODdVOWlYZEk3bC9vQWVsWEtndXFVV09aQUFBQUFFbEZUa1N1UW1DQyIgeD0iMCIgeT0iMCIgd2lkdGg9IjM1MHB4IiBoZWlnaHQ9IjM1MHB4IiAvPjxpbWFnZSBocmVmPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURBQUFBQXdCQU1BQUFDbExPUzBBQUFBSkZCTVZFVUFBQUFPRkI3cjdlelExSXp0d0cybndWVGtuejVDZURFZ1R5MXluVC9HZVNlT1R5bURyL1pIQUFBQUFYUlNUbE1BUU9iWVpnQUFBRk5KUkVGVU9NdGpHQVdqZ0dRZ0tJQXV3aWdJSmpkaXFwVVNBRWtzeEpSZ2RBUVNZZ0pZakJjU0ZCUk14R1l2bzVLTG13QjJGeGtIWW5lcXNKSzVBQTZKQ093U2txRXpzRXN3bGpmaURvOVJRQmNBQUNHYkIxdTNJU0VHQUFBQUFFbEZUa1N1UW1DQyIgeD0iMCIgeT0iMCIgd2lkdGg9IjM1MHB4IiBoZWlnaHQ9IjM1MHB4IiAvPjxpbWFnZSBocmVmPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURBQUFBQXdCQU1BQUFDbExPUzBBQUFBSjFCTVZFVUFBQUFPRkI3dDhpTEd6YzZtdExOeW5UOStsWmRVYjNtMWUxYmF0NUU0U1ZGK1RUL1p2QjRMelBQV0FBQUFBWFJTVGxNQVFPYllaZ0FBQUVaSlJFRlVPTXRqR0FXakFCOFFCQUpzNG94S1NrcHVBamdrekxCS0FFMHlvWTVFcDVCcUtGYUp4a05LMkNVMktpa0ttV0YzcnFDUU8xWUpvSTRxQVp4Qk1nb0dCQUFBbjJZSmU4MU9WMElBQUFBT1pWaEpaazFOQUNvQUFBQUlBQUFBQUFBQUFOSlRrd0FBQUFCSlJVNUVya0pnZ2c9PSIgeD0iMCIgeT0iMCIgd2lkdGg9IjM1MHB4IiBoZWlnaHQ9IjM1MHB4IiAvPjwvc3ZnPg==`,
      },
      {
        tokenId: "47",
        name: "Blobert #46",
        imageUrl: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIG1lZXQiIHN0eWxlPSJpbWFnZS1yZW5kZXJpbmc6IHBpeGVsYXRlZCIgdmlld0JveD0iMCAwIDM1MCAzNTAiPjxpbWFnZSBocmVmPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURBQUFBQXdBZ01BQUFBcWJCRVVBQUFBQ1ZCTVZFWHI3ZXdCcmJYR3pjNFpPSkJKQUFBQWcwbEVRVlFvejMzTndRMURJUXdEVURoa0JKYm9GSXlRU25oSnBpeXBnYnF0d0tmLzlIR2MvbUlWUUpzb1Q0eU1qOTRYcXNJSnE0RkdzS2l3SHpEeXJPQWRBb3dIOGtRTjJFUUtyQXJ4ZGRPUGFBcU1MQmhIbUJ6WXZiV2lwUjFUNUNNTXVnTTkxaFN1cU5wSmx6eDZ2Nks0QU8yRERBaTg3QjdCUDFjQWg5TTZxbmtCZnh4UTRkMEphMndBQUFBQVNVVk9SSzVDWUlJPSIgeD0iMCIgeT0iMCIgd2lkdGg9IjM1MHB4IiBoZWlnaHQ9IjM1MHB4IiAvPjxpbWFnZSBocmVmPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURBQUFBQXdCQU1BQUFDbExPUzBBQUFBSjFCTVZFVUFBQUFWSFNzT0ZCN2F0NUU0U1ZFZkxqaFViM2wrbFpmalVpYTFlMWJHemM3cjdleCtUVDhlaGd4VEFBQUFBWFJTVGxNQVFPYllaZ0FBQUxsSlJFRlVPTXZ0MExFS3dqQVFnT0hnNXVZVnU3ZXhndnVCRkxmQ1llZUMwUmNvMlNXMm9xdExSaDA3bGdydXZvVDRWdHExdVlLam9EK1o4bkhEbmZqMnBKUUIrMDg3OEJnWkVLVUplQzVFT3FldGdzQVpXR3BOdGNxOGp5RWluYmNBZ1FOcFNmVllPekNsdzJOZjZtZlNnWUZQNWo1NVB4NlFnNVhCTmhlVVFXdFBMTVJTempoWXg5YmFlZFlGOE5VUmNWRTRlNFRnYnhxOEtYQnVGWUpxOEpxTmhOUEZOMWlBWUtvcVJNRTJyRVJQdlhBVy8zNmdGL3BSTWFOSWl5VmRBQUFBQUVsRlRrU3VRbUNDIiB4PSIwIiB5PSIwIiB3aWR0aD0iMzUwcHgiIGhlaWdodD0iMzUwcHgiIC8+PGltYWdlIGhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBREFBQUFBd0JBTUFBQUNsTE9TMEFBQUFJVkJNVkVVQUFBRDZNbGFnSVVZT0ZCNWhKRVIrVFQrMWUxYmF0NUUySGlhT1R5bGxNU3ZMdU4rcEFBQUFBWFJTVGxNQVFPYllaZ0FBQU5kSlJFRlVPTXZ0ajhFTndqQVFCQzFvZ0QwYTRBNFhFSEpCNGgxU0FZZ1VBQThLb0FuK1ZFR1hyQlVJc2VEQmswZldrblhhOFdwOVlkU29YK1hGY3lpTHpKL2FjalY3RGhrb3pRd0xEcXJMSWd0QVRDV0VDZFI4R0ZEQWhCRVZTT2tEQU13SlpJSUV6djFQcGp1QUlTVlFUcWYyOGdLdHptdEZkN0Erdk1IK1dKbENtQUhnaC9iVXIrZDFBZ0lDY2U4N21Lbk5BSU1TRlBubUJGMkZmUURhZ3ErZ3E0ZzVhRWdFK2dXd3ZTWVFhekpRTlExQnBCOEpoZ0VxV2pUNlErQVYvYTBuVlFUWmUvcjNXOWhjODdVOWlYZEk3bC9vQWVsWEtndXFVV09aQUFBQUFFbEZUa1N1UW1DQyIgeD0iMCIgeT0iMCIgd2lkdGg9IjM1MHB4IiBoZWlnaHQ9IjM1MHB4IiAvPjxpbWFnZSBocmVmPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURBQUFBQXdCQU1BQUFDbExPUzBBQUFBSkZCTVZFVUFBQUFPRkI3cjdlelExSXp0d0cybndWVGtuejVDZURFZ1R5MXluVC9HZVNlT1R5bURyL1pIQUFBQUFYUlNUbE1BUU9iWVpnQUFBRk5KUkVGVU9NdGpHQVdqZ0dRZ0tJQXV3aWdJSmpkaXFwVVNBRWtzeEpSZ2RBUVNZZ0pZakJjU0ZCUk14R1l2bzVLTG13QjJGeGtIWW5lcXNKSzVBQTZKQ093U2txRXpzRXN3bGpmaURvOVJRQmNBQUNHYkIxdTNJU0VHQUFBQUFFbEZUa1N1UW1DQyIgeD0iMCIgeT0iMCIgd2lkdGg9IjM1MHB4IiBoZWlnaHQ9IjM1MHB4IiAvPjxpbWFnZSBocmVmPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURBQUFBQXdCQU1BQUFDbExPUzBBQUFBSjFCTVZFVUFBQUFPRkI3dDhpTEd6YzZtdExOeW5UOStsWmRVYjNtMWUxYmF0NUU0U1ZGK1RUL1p2QjRMelBQV0FBQUFBWFJTVGxNQVFPYllaZ0FBQUVaSlJFRlVPTXRqR0FXakFCOFFCQUpzNG94S1NrcHVBamdrekxCS0FFMHlvWTVFcDVCcUtGYUp4a05LMkNVMktpa0ttV0YzcnFDUU8xWUpvSTRxQVp4Qk1nb0dCQUFBbjJZSmU4MU9WMElBQUFBT1pWaEpaazFOQUNvQUFBQUlBQUFBQUFBQUFOSlRrd0FBQUFCSlJVNUVya0pnZ2c9PSIgeD0iMCIgeT0iMCIgd2lkdGg9IjM1MHB4IiBoZWlnaHQ9IjM1MHB4IiAvPjwvc3ZnPg==`,
      },
    ],
  };
  const tokenIds = searchParams.getAll("tokenIds");

  return (
    <LayoutContainer
      left={
        <Link to="/inventory">
          <Button variant="icon" size="icon">
            <ArrowIcon variant="left" />
          </Button>
        </Link>
      }
    >
      <LayoutHeader
        title={c.name}
        description={<CopyAddress address={c.address!} size="sm" />}
        icon={c.imageUrl ?? "/public/placeholder.svg"}
      />

      <LayoutContent className="pb-4">
        <div
          className="flex items-center gap-2 text-sm cursor-pointer self-start"
          onClick={() => {
            setSearchParams({
              tokenIds: tokenIds.length ? [] : c.assets.map((a) => a.tokenId),
            });
          }}
        >
          <CheckboxIcon
            variant={tokenIds.length ? "minus-line" : "unchecked-line"}
          />
          <div className="text-muted-foreground font-semibold uppercase">
            {tokenIds.length ? `${tokenIds.length} selected` : "Select all"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 place-items-center">
          {c.assets.map((a) => {
            const isSelected = tokenIds.includes(a.tokenId);
            return (
              <Link
                className="w-full aspect-square group"
                to={`/collection/${c.address}/${a.tokenId}`}
                key={a.tokenId}
              >
                <Card
                  className={cn(
                    "w-full h-full border-2 border-solid transition overflow-scroll",
                    isSelected ? "border-foreground" : "border-transparent",
                  )}
                >
                  <CardHeader className="flex flex-row items-center group-hover:opacity-70 p-0 justify-between">
                    <CardTitle className="truncate p-3">{a.name}</CardTitle>

                    <div className="h-full place-content-center">
                      <Button
                        size="icon"
                        variant="icon"
                        className="h-full w-auto aspect-square bg-transparent hover:bg-transparent"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          setSearchParams({
                            tokenIds: isSelected
                              ? tokenIds.filter(
                                  (tokenId) => tokenId !== a.tokenId,
                                )
                              : [...tokenIds, a.tokenId],
                          });
                        }}
                      >
                        <CheckboxIcon
                          variant={isSelected ? "line" : "unchecked-line"}
                        />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent
                    className="bg-cover bg-center flex py-4 h-full place-content-center overflow-hidden"
                    style={{
                      backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${
                        c.imageUrl ?? "/public/placeholder.svg"
                      })`,
                    }}
                  >
                    <img
                      className="object-contain transition group-hover:scale-110"
                      src={c.imageUrl ?? "/public/placeholder.svg"}
                    />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </LayoutContent>

      {!!tokenIds.length && (
        <LayoutFooter>
          <Link to={`/collection/${c.address}/send?${searchParams.toString()}`}>
            <Button className="w-full">Send ({tokenIds.length})</Button>
          </Link>
        </LayoutFooter>
      )}
    </LayoutContainer>
  );
}
