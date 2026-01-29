'use client'

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
} from '@tanstack/react-table'
import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createColumns } from './columns'
import type { ResourceWithRelations, Hub } from '@/lib/td-resources'

interface ResourcesTableProps {
  resources: ResourceWithRelations[]
  hiddenColumns?: string[]
  hubSlug: Hub
}

export function ResourcesTable({
  resources,
  hiddenColumns = [],
  hubSlug,
}: ResourcesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  // Create columns with hub context
  const allColumns = useMemo(() => createColumns(hubSlug), [hubSlug])

  const visibleColumns = useMemo(
    () => allColumns.filter((col) => !hiddenColumns.includes(col.id as string)),
    [allColumns, hiddenColumns]
  )

  const table = useReactTable({
    data: resources,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={visibleColumns.length}
              className="h-24 text-center"
            >
              No resources found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
