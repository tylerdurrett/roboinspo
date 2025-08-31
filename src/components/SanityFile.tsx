import { getFile } from '@/sanity/lib/client'
import { File as FileIcon } from 'lucide-react'

type Props = {
  value: {
    file: {
      asset: {
        _ref: string
      }
    }
    caption?: string
  }
}
export const SanityFile = ({ value }: Props) => {
  const fileAsset = getFile(value.file)
  const label =
    value.caption || fileAsset.asset.originalFilename || 'Download file'
  return (
    <div className="not-prose my-4 flex items-center rounded-xl border p-4">
      <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
        <FileIcon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <a
          href={`${fileAsset.asset.url}?dl=`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline"
        >
          {label}
        </a>
        <p className="text-sm text-muted-foreground">
          {fileAsset.asset.originalFilename}
        </p>
      </div>
    </div>
  )
}
