# Theming

This guide provides a comprehensive overview of how to create and apply custom themes to the controller.

## Creating a Theme

To create a theme, teams should commit the theme to [`packages/keychain/public/whitelabel`](https://github.com/cartridge-gg/controller/tree/main/packages/keychain/public/whitelabel) with the icon and banner included. The theme should conform to the `ControllerTheme` type:

```ts
type ControllerTheme = {
    id: string;
    name: string;
    icon: string;
    cover: string;
    colors: {
        primary?: string;
        primaryForeground?: string;
    };
};
```

See an example [`here`](https://github.com/cartridge-gg/controller/pull/421/files)
