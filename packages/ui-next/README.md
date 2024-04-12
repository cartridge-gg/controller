# @cartridge/ui-next

## Usage

```sh
pnpm add @cartridge/ui-next
```

`tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";
import { cartridgeTWPreset } from "./src/preset";

const config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}""],
  prefix: "",
  presets: [cartridgeTWPreset],
} satisfies Config;

export default config;
```

`index.tsx`

```ts
import { Button } from "@cartridge/ui-next"

export function MyComponent {
  return <Button className="" />
}
```

## Development

### Storybook

```sh
pnpm ui:next storybook
```

### Generate shadcn component

```sh
cd packages/ui-next
pnpm dlx shadcn-ui@latest add <component-name>
pnpm format
```
