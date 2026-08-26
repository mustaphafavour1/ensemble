import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  align?: "left" | "right";
  className?: string;
  render: (row: T) => ReactNode;
}

/**
 * Header and body cells are driven by the same column array, so alignment
 * can never drift between a <TableHead> and its corresponding <TableCell>.
 */
export function DataTable<T>({
  columns,
  data,
  getRowKey,
  onRowClick,
  zebra = true,
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  zebra?: boolean;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((col) => (
            <TableHead
              key={col.key}
              className={cn(col.align === "right" && "text-right", col.className)}
            >
              {col.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, i) => (
          <TableRow
            key={getRowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn(
              onRowClick && "cursor-pointer",
              zebra && i % 2 === 1 && "bg-white/[0.012]",
            )}
          >
            {columns.map((col) => (
              <TableCell
                key={col.key}
                className={cn(col.align === "right" && "text-right", col.className)}
              >
                {col.render(row)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
