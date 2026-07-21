"use client";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HoveredLink, Menu, MenuItem } from "./navbar-menu";
import { cn } from "../../lib/utils";

export function NavbarDemo() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <Navbar className="top-2" />
    </div>
  );
}

function Navbar({ className }) {
  const [active, setActive] = useState(null);
  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
        <Link
          to="/"
          className="cursor-pointer text-black hover:opacity-[0.9] dark:text-white"
          onMouseEnter={() => setActive(null)}
        >
          Home
        </Link>

        <MenuItem setActive={setActive} active={active} item="Products">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/agent">Agent</HoveredLink>
            <HoveredLink href="/exchange">Exchange</HoveredLink>
            <HoveredLink href="/spectra">Spectra AI</HoveredLink>
          </div>
        </MenuItem>

        <MenuItem setActive={setActive} active={active} item="Resources">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/guide">Guide</HoveredLink>
            <HoveredLink href="/journal">Journal</HoveredLink>
            <HoveredLink href="/about">About</HoveredLink>
          </div>
        </MenuItem>

        <Link
          to="/mint"
          className="cursor-pointer text-black hover:opacity-[0.9] dark:text-white"
          onMouseEnter={() => setActive(null)}
        >
          Pricing
        </Link>
      </Menu>
    </div>
  );
}
