import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface PaginationEvent {
  pageIndex: number;
  pageSize: number;
}

@Component({
  selector: 'app-pagination',
  template: `
    <div class="pagination">
      <div class="pagination-info">
        Affichage {{ (pageIndex * pageSize) + 1 }}-{{ Math.min((pageIndex + 1) * pageSize, total) }} sur {{ total }}
      </div>
      <div class="pagination-controls">
        <button
          class="btn btn-sm btn-outline"
          [disabled]="pageIndex === 0"
          (click)="goToPage(pageIndex - 1)"
        >
          <span class="material-icons">chevron_left</span> Précédent
        </button>
        <div class="page-numbers">
          <button
            *ngFor="let page of getPageNumbers()"
            class="page-number"
            [class.active]="page === pageIndex"
            (click)="goToPage(page)"
          >
            {{ page + 1 }}
          </button>
        </div>
        <button
          class="btn btn-sm btn-outline"
          [disabled]="pageIndex >= Math.ceil(total / pageSize) - 1"
          (click)="goToPage(pageIndex + 1)"
        >
          Suivant <span class="material-icons">chevron_right</span>
        </button>
      </div>
      <select class="page-size-select" [value]="pageSize" (change)="onPageSizeChange($event)">
        <option value="10">10 par page</option>
        <option value="25">25 par page</option>
        <option value="50">50 par page</option>
        <option value="100">100 par page</option>
      </select>
    </div>
  `,
  styles: [`
    .pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 16px;
      background: var(--bg-card);
      border-top: 1px solid var(--border);
      flex-wrap: wrap;
    }

    .pagination-info {
      font-size: 0.875rem;
      color: var(--text-secondary);
      white-space: nowrap;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .page-numbers {
      display: flex;
      gap: 4px;
    }

    .page-number {
      min-width: 36px;
      height: 36px;
      padding: 0;
      border: 1px solid var(--border);
      background: var(--bg-surface);
      color: var(--text-primary);
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all var(--t-fast);
    }

    .page-number:hover {
      border-color: var(--primary);
      color: var(--primary);
    }

    .page-number.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .page-size-select {
      height: 36px;
      padding: 0 12px;
      border-radius: var(--radius-sm);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      color: var(--text-primary);
      cursor: pointer;
      font-size: 0.875rem;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .material-icons {
      font-size: 18px;
    }

    @media (max-width: 768px) {
      .pagination {
        flex-direction: column;
        align-items: stretch;
      }

      .pagination-controls {
        justify-content: center;
      }

      .page-numbers {
        max-width: 200px;
        overflow-x: auto;
      }
    }
  `]
})
export class PaginationComponent {
  @Input() pageIndex = 0;
  @Input() pageSize = 10;
  @Input() total = 0;
  @Output() pageChange = new EventEmitter<PaginationEvent>();
  @Output() pageSizeChange = new EventEmitter<number>();

  Math = Math;

  goToPage(page: number): void {
    if (page >= 0 && page < Math.ceil(this.total / this.pageSize)) {
      this.pageChange.emit({ pageIndex: page, pageSize: this.pageSize });
    }
  }

  onPageSizeChange(event: any): void {
    const newSize = parseInt(event.target.value, 10);
    this.pageSizeChange.emit(newSize);
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.total / this.pageSize);
    const maxVisible = 5;
    const pages: number[] = [];

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(0, this.pageIndex - 2);
      let end = Math.min(totalPages, start + maxVisible);

      if (end - start < maxVisible) {
        start = Math.max(0, end - maxVisible);
      }

      for (let i = start; i < end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }
}
