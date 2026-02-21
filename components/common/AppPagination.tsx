"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AppPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function AppPagination({
  currentPage,
  totalPages,
  onPageChange,
}: AppPaginationProps) {
  if (totalPages <= 1) return null;

  const handleChange = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pages = [];
  const maxVisible = 5;

  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, currentPage + 2);

  if (currentPage <= 3) {
    start = 1;
    end = Math.min(totalPages, maxVisible);
  }

  if (currentPage >= totalPages - 2) {
    start = Math.max(1, totalPages - maxVisible + 1);
    end = totalPages;
  }

  if (start > 1) {
    pages.push(
      <PaginationItem key={1}>
        <PaginationLink onClick={() => handleChange(1)}>1</PaginationLink>
      </PaginationItem>,
    );

    if (start > 2) {
      pages.push(
        <PaginationItem key="start-ellipsis">
          <span className="px-2">...</span>
        </PaginationItem>,
      );
    }
  }

  for (let i = start; i <= end; i++) {
    pages.push(
      <PaginationItem key={i}>
        <PaginationLink
          isActive={currentPage === i}
          onClick={() => handleChange(i)}
        >
          {i}
        </PaginationLink>
      </PaginationItem>,
    );
  }

  if (end < totalPages) {
    if (end < totalPages - 1) {
      pages.push(
        <PaginationItem key="end-ellipsis">
          <span className="px-2">...</span>
        </PaginationItem>,
      );
    }

    pages.push(
      <PaginationItem key={totalPages}>
        <PaginationLink onClick={() => handleChange(totalPages)}>
          {totalPages}
        </PaginationLink>
      </PaginationItem>,
    );
  }

  return (
    <div className="flex justify-center mt-6 w-full overflow-x-auto">
      <Pagination>
        <PaginationContent className="flex-wrap sm:flex-nowrap">
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 1 && handleChange(currentPage - 1)}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {pages}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                currentPage < totalPages && handleChange(currentPage + 1)
              }
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
