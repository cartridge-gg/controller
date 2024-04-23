# @cartridge/ui-next

## Usage

1. Install packages

```sh
pnpm add @cartridge/ui-next tailwindcss postcss autoprefixer
```

2. Initialize tailwind config

This will create `tailwind.config.js` and `postcss.config.js`.

```sh
npx tailwindcss init -p
```

3. Add `catrdigeTWPlugin` in your `tailwind.config.ts`

```ts
import { Config } from "tailwindcss";
import { cartridgeTWPlugin } from "@cartridge/ui-next";

const config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@cartridge/ui-next/lib/**/*.{js}",
  ],
  prefix: "",
  plugin: [cartridgeTWPlugin],
} satisfies Config;

export default config;
```

4. Import themes in your `global.css`

```css
@import url("../node_modules/@cartridge/ui-next/dist/themes/default.css");
@import url("../node_modules/@cartridge/ui-next/dist/themes/dark.css");
@import url("../node_modules/@cartridge/ui-next/dist/themes/fonts.css");

@tailwind base;
@tailwind components;
@tailwind utilities;
```

5. Import the `global.css` in the entry file (`_app.json`, `layout.json`,
   `index.tsx` etc.)

```ts
import "./global.css"
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
