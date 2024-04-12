# @cartridge/ui-next

## Usage

```sh
pnpm add @cartridge/ui-next
```

1. Add `catrdigeTWPlugin` in your `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";
import { cartridgeTWPlugin } from "@cartridge/ui-next";

const config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}""],
  prefix: "",
  plugin: [cartridgeTWPlugin],
} satisfies Config;

export default config;
```

2. Import themes in your `global.css`

```css
@import url("@cartridge/ui-next/themes/default.css");
@import url("@cartridge/ui-next/themes/dark.css");
@import url("@cartridge/ui-next/themes/fonts.css");

@tailwind base;
@tailwind components;
@tailwind utilities;
```

3. `index.tsx`

```ts
import { Button } from "@cartridge/ui-next"

export function MyComponent {
  return (
    <div className="p-4 bg-background">
      <Button onClick={() => console.log("clicked!")}>Click me</Button>
    </div>
  )
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
