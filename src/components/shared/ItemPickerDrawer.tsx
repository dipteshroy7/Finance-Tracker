import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ItemPickerDrawerProps {
  open: boolean
  setOpen: (open: boolean) => void
  title: string
  children: React.ReactNode
}

export function ItemPickerDrawer({ open, setOpen, title, children }: ItemPickerDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-text dark:text-text-dark">{title}</DialogTitle>
            <DialogDescription className="sr-only">Pick an item</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh] p-4">
            {children}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="max-h-[92vh] glass-card border-t border-white/10 text-white shadow-2xl">
        <DrawerHeader className="text-center">
          <DrawerTitle className="text-center text-white text-lg font-medium tracking-wide">
            {title}
          </DrawerTitle>
          <DrawerDescription className="sr-only">Pick an item</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-8">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
