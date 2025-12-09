"use client"

// import Link from "next/link"
import { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface NavProps {
  isCollapsed: boolean
  links: {
    icon: LucideIcon,
    label?: string
    title: string,
    variant: "default" | "ghost"
  }[]
}

export function Nav({ isCollapsed, links }: NavProps) {
  return (
    <div
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
      data-collapsed={isCollapsed}
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) =>
          isCollapsed ? (
            <Tooltip delayDuration={0} key={index}>
              <TooltipTrigger asChild>
                <a
                  className={cn(
                    buttonVariants({ size: "icon", variant: link.variant }),
                    "size-9",
                    link.variant === "default" &&
                      "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                  )}
                  href="#"
                >
                  <link.icon className="size-4" />
                  <span className="sr-only">{link.title}</span>
                </a>
              </TooltipTrigger>
              <TooltipContent className="flex items-center gap-4" side="right">
                {link.title}
                {link.label && (
                  <span className="ml-auto text-muted-foreground">
                    {link.label}
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          ) : (
        
            <a
              className={cn(
                buttonVariants({ size: "sm", variant: link.variant }),
                link.variant === "default" &&
                  "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                "justify-start"
              )}
              href="#"
              key={index}
            >
              <link.icon className="mr-2 size-4" />
              {link.title}
              {link.label && (
                <span
                  className={cn(
                    "ml-auto",
                    link.variant === "default" &&
                      "text-background dark:text-white"
                  )}
                >
                  {link.label}
                </span>
              )}
            </a>
          )
        )}
      </nav>
    </div>
  )
}