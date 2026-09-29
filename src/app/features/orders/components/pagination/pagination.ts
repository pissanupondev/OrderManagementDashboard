import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-pagination',
  styleUrl: './pagination.css',
  templateUrl: './pagination.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Pagination {
 currentPage = input<number>(1);
  totalPages = input<number>(1);
  pageChange = output<number>();

  // 1. สำหรับ Desktop/Tablet (แสดงทุกหน้าเหมือนเดิม)
  pagesArray = computed(() => {
    const total = this.totalPages();
    if (!total || total < 1) return [];
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  // 2. สำหรับ Mobile จอเล็ก 360px (แสดงเฉพาะ 3 หน้าใกล้เคียง)
  mobilePagesArray = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (!total || total < 1) return [];
    if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1);

    if (current <= 1) {
      return [1, 2, 3];
    }

    if (current >= total) {
      return [total - 2, total - 1, total];
    }

    return [current - 1, current, current + 1];
  });

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }
}