'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function PaginationInner({ totalPages, currentPage }: { totalPages: number, currentPage: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <button 
        disabled={currentPage <= 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <span className="text-sm font-medium text-slate-300">
        Page {currentPage} of {totalPages}
      </span>

      <button 
        disabled={currentPage >= totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function PaginationControls(props: { totalPages: number, currentPage: number }) {
  return (
    <Suspense fallback={<div className="h-10"></div>}>
      <PaginationInner {...props} />
    </Suspense>
  );
}
