"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import {
  Button,
  DesktopIcon,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  MoonIcon,
  SunIcon,
} from "@cartridge/ui-next";

export function ColorModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="text-foreground">
          {theme === "system" ? (
            <DesktopIcon className="fill-foreground" />
          ) : theme === "light" ? (
            <SunIcon variant="line" className="fill-foreground" />
          ) : (
            <MoonIcon variant="line" className="fill-foreground" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
