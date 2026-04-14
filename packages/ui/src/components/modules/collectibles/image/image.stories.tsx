import type { Meta, StoryObj } from "@storybook/react";
import { CollectibleImage, CollectibleImageProps } from ".";

const meta: Meta<typeof CollectibleImage> = {
  title: "Modules/Collectibles/Image",
  component: CollectibleImage,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    images: [
      "https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png",
    ],
    onLoaded: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof CollectibleImage>;

// export const Default: Story = {};
export const Default: Story = {
  render: function Render(args: CollectibleImageProps) {
    return (
      <div className="flex gap-2 w-full h-[200px] border border-foreground-400">
        <CollectibleImage {...args} />
      </div>
    );
  },
};

export const DataUri: Story = {
  render: function Render(args: CollectibleImageProps) {
    return (
      <div className="flex gap-2 w-full h-[200px] border border-foreground-400">
        <CollectibleImage
          {...args}
          images={[
            "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0NzAnIGhlaWdodD0nNjAwJz48c3R5bGU+dGV4dHt0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO2ZvbnQtZmFtaWx5OiBDb3VyaWVyLCBtb25vc3BhY2U7ZmlsbDogI2ZmZTk3Zjt9Z3tmaWxsOiAjZmZlOTdmO308L3N0eWxlPjxyZWN0IHg9JzAuNScgeT0nMC41JyB3aWR0aD0nNDY5JyBoZWlnaHQ9JzU5OScgcng9JzI3LjUnIGZpbGw9J2JsYWNrJyBzdHJva2U9JyNmZmU5N2YnLz48ZyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgyMCwyNSkgc2NhbGUoMC41KSc+PHBhdGggZD0iTTMyLjkxNCAzMS4xMzNhMTM1IDEzNSAwIDAgMC03LjMxMi0xMS41NzVsMS45NzQtMS4yMTUgMi4wODIgMi44NTRhMTAzIDEwMyAwIDAgMCA0LjgwMy0yLjA2MXEyLjQwMy0xLjExIDUuMjMtMS4yMTYgNi40Ni4xMDUgOS44NzUgNC44NjJhMzAuNyAzMC43IDAgMCAxIDIuODI5IDQuOTY4IDEzNCAxMzQgMCAwIDEgMS45NzQgNS42NTZxLjQyNyAyLjI3MiAxLjA2OCA0LjY1YTI2LjYgMjYuNiAwIDAgMCAxLjY1NCA0LjY1MiAxMC43IDEwLjcgMCAwIDAgMi43MjIgMy41OTRjMi4zMTcgMi4wODUgNi4wNiAyLjA4NSA4LjM3NyAwYTEwLjcgMTAuNyAwIDAgMCAyLjcyMi0zLjU5NCAyNi42IDI2LjYgMCAwIDAgMS42NTQtNC42NTEgNjIgNjIgMCAwIDAgMS4wNjgtNC42NTEgMTM0IDEzNCAwIDAgMSAxLjk3NS01LjY1NSAzMC43IDMwLjcgMCAwIDEgMi44MjgtNC45NjlxMy40MTctNC43NTYgOS44NzQtNC44NjIgMi44My4xMDYgNS4yMyAxLjIxNWExMDMgMTAzIDAgMCAwIDQuODA0IDIuMDYybDIuMDgyLTIuODU0IDEuOTc1IDEuMjE1YTEzNSAxMzUgMCAwIDAtNy4zMTIgMTEuNTc1IDEwIDEwIDAgMCAxLTIuNjE2LS45NTEgMjMgMjMgMCAwIDAtMi41NjItMS40MjdxLTEuMTczLS42MzQtMi44MjgtMS4yMTYtMS42MDItLjUyOC0zLjY4My0uNTI4LTIuODgyIDAtNC45NjQgMS41MzItMi4yOTUgMS42NC0yLjI5NSA0LjY1MSAwIDIuNjk2IDEuNzYxIDUuMjg2IDEuNjU1IDIuNjk1IDQuMTY0IDMuOTFhMjIuMSAyMi4xIDAgMCAwIDcuNDE4IDEuMDU4cTIuMDgyIDAgNC4xNjMtLjIxMnY3LjUwNWgtOS43MTNMNjcuMTgyIDExNS4ybDMuMTU1LTU3LjgzN2MuMTk2LTMuNTk4LTIuNjk3LTYuNjIyLTYuMzM1LTYuNjIycy02LjUzMiAzLjAyNC02LjMzNiA2LjYyMmwzLjE1NSA1Ny44MzdMNDQuMDcgNTAuNzQxaC05LjcxNHYtNy41MDVxMi4wOC4yMTIgNC4xNjMuMjEyIDMuNzg5LjEwNSA3LjQxOS0xLjA1NyAyLjUwOC0xLjIxNSA0LjE2My0zLjkxMSAxLjc2LTIuNTkgMS43Ni01LjI4NiAwLTMuMDEyLTIuMjk0LTQuNjUtMi4wODEtMS41MzQtNC45NjQtMS41MzMtMi4wODEgMC0zLjY4Mi41MjgtMS42NTYuNTgyLTIuODMgMS4yMTYtMS4zMzQuNjMzLTIuNTYxIDEuNDI3YTEwIDEwIDAgMCAxLTIuNjE1Ljk1MSIvPjwvZz48dGV4dCB4PScxMDAnIHk9JzUwJyBmb250LXNpemU9JzI0JyB0ZXh0LWFuY2hvcj0nbGVmdCcgZG9taW5hbnQtYmFzZWxpbmU9J21pZGRsZSc+IzA8L3RleHQ+PHRleHQgeD0nMTAwJyB5PSc3MicgZm9udC1zaXplPScxNicgdGV4dC1hbmNob3I9J2xlZnQnIGRvbWluYW50LWJhc2VsaW5lPSdtaWRkbGUnPkdhbWUgbm90IHN0YXJ0ZWQ8L3RleHQ+PC9zdmc+",
          ]}
        />
      </div>
    );
  },
};

export const CorrectedBeastDataUri: Story = {
  render: function Render(args: CollectibleImageProps) {
    return (
      <div className="flex gap-2 w-full h-[200px] border border-foreground-400">
        <CollectibleImage
          {...args}
          images={[
            'data:image/svg+xml;utf8,<svg width="100width="100%" height="100height="100%" viewBox="0 0 20000 20000" xmlns="http://www.w3.org/2000/svg"><style>svg{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAASFJREFUSIm1VW2uxCAIVE/dI+yt3/vBBu0wfLVZstlQhAFGxTF+IH+frc+HYVc1aj1Al0+wgKeuVjugcGkfXhGJX1r+KT2K0oqkp6KzW1cjst5BXdrlQ6TV35ZDsYJ9BiEUaXAKUTlL01rn9dVVGfcjD7hwGyBkqVX9VKekx23ZkHVmO3PQYDqOaEO6OsHppMV+gsiq/ivUaVlevaM8MhURsoosMckvQN8tM7vNsR28isAyzOmie+CluWE9uKUSRW9P6T0ABnawuRy26sa4tuxXHtG8A0rxqcRSpYiia9ZXCbwNuKH4OUp78Gb6NyhyIUKK8g7s+QH0OH2VIjoqFD0aiCk0iXGqpo327kEXfaQUwQa4I/Nyh1iDIvumDsYhtPIPgYPBCOPyCoAAAAAASUVORK5CYII=);background-repeat:no-repeat;background-size:contain;background-position:center;image-rendering:-webkit-optimize-contrast;-ms-interpolation-mode:nearest-neighbor;image-rendering:-moz-crisp-edges;image-rendering:pixelated;}</style></svg>',
          ]}
        />
      </div>
    );
  },
};

export const CorrectedGoldenTokenUrl: Story = {
  render: function Render(args: CollectibleImageProps) {
    return (
      <div className="flex gap-2 w-full h-[200px] border border-foreground-400">
        <CollectibleImage
          {...args}
          images={[
            "https://api.cartridge.gg/x/arcade-main/torii/static/0x04f5e296c805126637552cf3930e857f380e7c078e8f00696de4fc8545356b1d/0x0000000000000000000000000000000000000000000000000000000000000001/image",
          ]}
        />
      </div>
    );
  },
};

export const EmptyImageList: Story = {
  render: function Render(args: CollectibleImageProps) {
    return (
      <div className="flex gap-2 w-full h-[200px] border border-foreground-400">
        <CollectibleImage {...args} images={[]} />
      </div>
    );
  },
};

export const BadUrl: Story = {
  render: function Render(args: CollectibleImageProps) {
    return (
      <div className="flex gap-2 w-full h-[200px] border border-foreground-400">
        <CollectibleImage
          {...args}
          images={["/this_image_does_not_exist.png"]}
        />
      </div>
    );
  },
};

export const BadUrlWithFallback: Story = {
  render: function Render(args: CollectibleImageProps) {
    return (
      <div className="flex gap-2 w-full h-[200px] border border-foreground-400">
        <CollectibleImage
          {...args}
          images={[
            "/this_image_does_not_exist.png",
            "https://static.cartridge.gg/presets/loot-survivor/icon.png",
          ]}
        />
      </div>
    );
  },
};

export const IpfsDirect: Story = {
  render: function Render(args: CollectibleImageProps) {
    return (
      <div className="flex gap-2 w-full h-[200px] border border-foreground-400">
        <CollectibleImage
          {...args}
          images={[
            "ipfs://bafkreih5aznjvttude6c3wbvqeebb6rlx5wkbzyppv7garjiubll2ceym4",
          ]}
        />
      </div>
    );
  },
};

export const IpfsPinnedFile: Story = {
  render: function Render(args: CollectibleImageProps) {
    return (
      <div className="flex gap-2 w-full h-[200px] border border-foreground-400">
        <CollectibleImage
          {...args}
          images={[
            "https://ipfs.io/ipfs/bafkreih5aznjvttude6c3wbvqeebb6rlx5wkbzyppv7garjiubll2ceym4",
          ]}
        />
      </div>
    );
  },
};

export const IpfsUnpinnedFile: Story = {
  render: function Render(args: CollectibleImageProps) {
    return (
      <div className="flex gap-2 w-full h-[200px] border border-foreground-400">
        <CollectibleImage
          {...args}
          images={[
            "https://ipfs.io/ipfs/QmWqqT4awbuzaHM7e5EBf9GGzNDQRz4WauUDSctVe9ZeBW",
          ]}
        />
      </div>
    );
  },
};

export const IpfsUnpinnedLoadingSkeleton: Story = {
  render: function Render(args: CollectibleImageProps) {
    return (
      <div className="flex gap-2 w-full h-[200px] border border-foreground-400">
        <CollectibleImage
          {...args}
          images={[
            "https://ipfs.io/ipfs/QmWqqT4awbuzaHM7e5EBf9GGzNDQRz4WauUDSctVe9ZeBW",
          ]}
          loadingSkeleton={true}
        />
      </div>
    );
  },
};

export const IpfsUnpinnedLoadingSpinner: Story = {
  render: function Render(args: CollectibleImageProps) {
    return (
      <div className="flex gap-2 w-full h-[200px] border border-foreground-400">
        <CollectibleImage
          {...args}
          images={[
            "https://ipfs.io/ipfs/QmWqqT4awbuzaHM7e5EBf9GGzNDQRz4WauUDSctVe9ZeBW",
          ]}
          loadingSpinner={true}
        />
      </div>
    );
  },
};
