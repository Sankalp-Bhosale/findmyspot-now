
import * as React from "react"
import { cva } from "class-variance-authority"
import { ChevronRight, CircleUser, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

const sidebarVariants = cva(
  "fixed top-0 z-50 flex h-full w-[18rem] flex-col border-r bg-background/95 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300",
  {
    variants: {
      side: {
        left: "left-0 border-r",
        right: "right-0 border-l",
      },
      variant: {
        default: "",
        secondary: "bg-secondary",
      },
    },
    defaultVariants: {
      side: "left",
      variant: "default",
    },
  }
)

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right"
  variant?: "default" | "secondary"
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, side, variant, ...props }, ref) => {
    return (
      <div className={cn(sidebarVariants({ side, variant, className }))} ref={ref} {...props} />
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarClose = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "absolute right-4 top-4 md:hidden",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
SidebarClose.displayName = "SidebarClose"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div className={cn("flex items-center justify-between py-4 px-6", className)} ref={ref} {...props} />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div className={cn("flex-1 overflow-y-auto py-2 px-4", className)} ref={ref} {...props} />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div className={cn("py-4 px-6", className)} ref={ref} {...props} />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => {
  return (
    <ul className={cn("menu px-1", className)} ref={ref} {...props} />
  )
})
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => {
  return (
    <li className={cn("", className)} ref={ref} {...props} />
  )
})
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => {
  return (
    <a className={cn("flex items-center gap-2 rounded-md py-2 px-3 text-sm", className)} ref={ref} {...props}>
      {props.children}
    </a>
  )
})
SidebarMenuLink.displayName = "SidebarMenuLink"

const SidebarAccordion = React.forwardRef<
  React.ElementRef<typeof Collapsible>,
  React.ComponentPropsWithoutRef<typeof Collapsible>
>(({ className, ...props }, ref) => {
  return (
    <Collapsible className={cn("border-b", className)} ref={ref} {...props} />
  )
})
SidebarAccordion.displayName = "SidebarAccordion"

const SidebarAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsibleTrigger>,
  React.ComponentPropsWithoutRef<typeof CollapsibleTrigger>
>(({ className, ...props }, ref) => {
  return (
    <CollapsibleTrigger
      className={cn(
        "flex items-center justify-between gap-2 rounded-md py-2 px-3 text-sm font-medium transition-all hover:bg-secondary/50 [&[data-state=open]>svg]:rotate-90",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
SidebarAccordionTrigger.displayName = "SidebarAccordionTrigger"

const SidebarAccordionContent = React.forwardRef<
  React.ElementRef<typeof CollapsibleContent>,
  React.ComponentPropsWithoutRef<typeof CollapsibleContent>
>(({ className, ...props }, ref) => {
  return (
    <CollapsibleContent
      className={cn(
        "overflow-hidden pl-8 text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
SidebarAccordionContent.displayName = "SidebarAccordionContent"

export {
  Sidebar,
  SidebarClose,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarAccordion,
  SidebarAccordionTrigger,
  SidebarAccordionContent,
}
