import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type TableRow = {
  _key: string
  _type: 'tableRow'
  cells: string[]
}

type SanityTableProps = {
  value: {
    rows: TableRow[]
  }
}

export const SanityTable = ({ value }: SanityTableProps) => {
  const { rows } = value
  if (!rows || rows.length === 0) {
    return null
  }

  const headers = rows[0].cells
  const bodyRows = rows.slice(1)

  return (
    <div className="my-6 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header, index) => (
              <TableHead key={index}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {bodyRows.map((row) => (
            <TableRow key={row._key}>
              {row.cells.map((cell, index) => (
                <TableCell key={index}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
