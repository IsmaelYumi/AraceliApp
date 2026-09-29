import React from 'react';
import { Spinner } from './Spinner';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No se encontraron registros',
  keyExtractor,
  onRowClick,
  className = '',
}: TableProps<T>): React.ReactElement {
  return (
    <div className={`w-full overflow-x-auto rounded-2xl bg-white shadow-soft-sm ${className}`}>
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`py-3.5 px-5 ${col.headerClassName || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-slate-500">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Spinner size="lg" color="border-serenity-500 border-t-transparent" />
                  <span className="text-xs">Cargando datos clínicos...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-10 text-center text-slate-400">
                <p className="text-sm font-medium">{emptyMessage}</p>
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const rowKey = keyExtractor(item);
              const isClickable = Boolean(onRowClick);

              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-colors duration-150 ${
                    isClickable ? 'cursor-pointer hover:bg-serenity-50/40' : 'hover:bg-slate-50/50'
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`py-4 px-5 text-slate-700 ${col.className || ''}`}>
                      {col.render
                        ? col.render(item, index)
                        : (item as Record<string, unknown>)[col.key] !== undefined
                        ? String((item as Record<string, unknown>)[col.key])
                        : null}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
