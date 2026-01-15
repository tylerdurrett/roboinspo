'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyText = 'No options found.',
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter((v) => v !== value))
  }

  const selectedLabels = selected
    .map((v) => options.find((o) => o.value === v)?.label)
    .filter(Boolean)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'h-auto min-h-9 justify-between',
            selected.length > 0 && 'h-auto',
            className
          )}
        >
          {selected.length === 0 ? (
            <span className="text-muted-foreground font-normal">
              {placeholder}
            </span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectedLabels.slice(0, 2).map((label, idx) => (
                <Badge
                  key={selected[idx]}
                  variant="secondary"
                  className="text-xs"
                >
                  {label}
                  <button
                    className="ml-1 hover:text-destructive"
                    onClick={(e) => handleRemove(selected[idx], e)}
                    aria-label={`Remove ${label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {selected.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{selected.length - 2} more
                </Badge>
              )}
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selected.includes(option.value)
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
