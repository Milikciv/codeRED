import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const to   = Math.min(page * pageSize, totalItems)

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
      <span>Showing {from}–{to} of {totalItems} {totalItems === 1 ? 'item' : 'items'}</span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-7 h-7 rounded-lg border text-xs font-medium transition-colors ${
              p === page
                ? 'bg-primary text-white border-primary'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export function usePagination(items, pageSize) {
  return {
    totalItems: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
    slice: (page) => items.slice((page - 1) * pageSize, page * pageSize),
  }
}
