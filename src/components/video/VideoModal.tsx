'use client'

import { useState, type ReactElement } from 'react'
import MuxPlayer from '@mux/mux-player-react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type VideoModalProps = {
  playbackId: string
  trigger: ReactElement
  title?: string
  poster?: string
}

export default function VideoModal({
  playbackId,
  trigger,
  title,
  poster,
}: VideoModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        showCloseButton
        className="bg-black p-0 border-0 w-[min(92vw,1200px)] sm:max-w-5xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title ?? 'Video player'}</DialogTitle>
        </DialogHeader>
        {/* Render player only while open so it starts on open and stops on close */}
        {open ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <MuxPlayer
              playbackId={playbackId}
              streamType="on-demand"
              autoPlay
              muted={false}
              playsInline
              poster={poster}
              metadata={title ? { video_title: title } : undefined}
              className="absolute inset-0 w-full h-full"
              accentColor="var(--color-yellow)"
              style={{
                width: '100%',
                height: '100%',
                ['--media-object-fit' as string]: 'cover',
              }}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
