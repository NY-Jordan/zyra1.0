'use client'
import React from "react"

type PaginationProps = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        className="px-3 py-1 border dark:border-slate-600 rounded disabled:opacity-50 dark:text-slate-300"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Précédent
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          className={`px-3 py-1 border dark:border-slate-600 rounded dark:text-slate-300 ${page === i + 1 ? "bg-gray-200 dark:bg-slate-700 font-bold" : ""}`}
          onClick={() => onPageChange(i + 1)}
        >
          {i + 1}
        </button>
      ))}
      <button
        className="px-3 py-1 border dark:border-slate-600 rounded disabled:opacity-50 dark:text-slate-300"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Suivant
      </button>
        </div>
      )
    }