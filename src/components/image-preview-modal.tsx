'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImagePreviewModalProps {
  src: string
  alt: string
  width: number
  height: number
  children: React.ReactNode
  className?: string
  wrapperClassName?: string
}

export function ImagePreviewModal({
  src,
  alt,
  width,
  height,
  children,
  className,
  wrapperClassName,
}: ImagePreviewModalProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div
          className={cn(
            'aspect-video overflow-hidden rounded-lg cursor-pointer',
            wrapperClassName
          )}
        >
          {children}
        </div>
      </DialogTrigger>
      <DialogContent
        className={cn('max-w-4xl sm:max-w-4xl p-0', className)}
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{alt}</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="h-auto w-full rounded-lg"
          />
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 rounded-full bg-black/50 text-white hover:bg-black/75"
            >
              <XIcon className="size-6" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
