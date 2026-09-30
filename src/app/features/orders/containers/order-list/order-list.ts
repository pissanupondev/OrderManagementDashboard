import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { OrderFilterState, OrderItem, StatusFormPayload } from '../../models/order.model';
import { OrderTable } from '../../components/order-table/order-table';
import { CommonModule } from '@angular/common';
import { OrderFilter } from '../../components/order-filter/order-filter';
import { calculateTotalPrice, groupByKey } from '../../../../shared/ีutils/order.utils';
import { OrderStatusModal } from '../../components/order-status-modal/order-status-modal';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, switchMap, tap } from 'rxjs';

@Component({
  imports: [CommonModule,OrderTable,OrderFilter,OrderStatusModal],
  selector: 'app-order-list',
  styleUrl: './order-list.css',
  templateUrl: './order-list.html',
})
export class OrderList implements OnInit{
  private orderService = inject(OrderService);
  private destroyRef = inject(DestroyRef);

  private filter$ = new Subject<OrderFilterState>();

  allOrders = signal<OrderItem[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  filterState = signal<OrderFilterState>({
    keyword: '',
    status: 'ทั้งหมด',
    startDate: '',
    endDate: ''
  });

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  isModalOpen = signal<boolean>(false);
  selectedOrder = signal<OrderItem | null>(null);
  isUpdatingStatus = signal<boolean>(false);
  
  filteredOrders = computed(() => {
    const orders = this.allOrders();
    const { keyword, status, startDate, endDate } = this.filterState(); // 👈 ดึง keyword เพิ่มเติม

    return orders.filter(item => {
      // 1. ค้นหาจาก Keyword (ร้าน, หมายเลขสั่งซื้อ, รายการ )
      const cleanKeyword = keyword.trim().toLowerCase();
      let matchKeyword = true;
      if (cleanKeyword) {
        matchKeyword = 
          (item.orderNo?.toLowerCase().includes(cleanKeyword) ?? false) ||
          (item.shopName?.toLowerCase().includes(cleanKeyword) ?? false) ||
          (item.productName?.toLowerCase().includes(cleanKeyword) ?? false) 
          // (item.variant?.toLowerCase().includes(cleanKeyword) ?? false);
      }

      // 2. ค้นหาจาก สถานะ
      const matchStatus = status === 'ทั้งหมด' || item.status === status;

      // 3. ค้นหาจาก ช่วงวันที่สั่งซื้อ
      let matchDate = true;
      if (startDate || endDate) {
        const itemDate = new Date(item.orderDate || '').getTime();
        const start = startDate ? new Date(startDate).getTime() : -Infinity;
        // กำหนดเวลาสิ้นสุดให้ครอบคลุมทั้งวัน (23:59:59.999)
        const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Infinity;
        
        matchDate = itemDate >= start && itemDate <= end;
      }

      return matchKeyword && matchStatus && matchDate;
    });
  });

  totalPages = computed(() => {
    const total = this.filteredOrders().length;
    return Math.ceil(total / this.pageSize()) || 1;
  });

  displayedOrders = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredOrders().slice(start, start + this.pageSize());
  });

  totalNetAmount = computed(() => {
    return calculateTotalPrice(this.filteredOrders(), 'totalAmount');
  });

  ngOnInit(): void {
    this.setupFilterStream();
    this.triggerSearch();
  }

  private triggerSearch(): void {
    this.filter$.next(this.filterState());
  }

  // private loadOrders(): void {
  //   this.isLoading.set(true);
  //   this.errorMessage.set('');

  //   this.orderService.getOrders().pipe(
  //     takeUntilDestroyed(this.destroyRef)
  //   ).subscribe({
  //     next: (data) => {
  //       this.allOrders.set(data);
  //       this.isLoading.set(false);
  //     },
  //     error: (err) => {
  //       console.error('Error loading order list:', err);
  //       this.errorMessage.set(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
  //       this.isLoading.set(false);
  //     }
  //   });
  // }

  private setupFilterStream(): void {
    this.filter$.pipe(
      tap(() => {
        this.isLoading.set(true);
        this.errorMessage.set('');
      }),
      debounceTime(300),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      switchMap(filters => 
        this.orderService.getOrders(filters).pipe(
          catchError((err: Error) => {
            this.errorMessage.set(err.message);
            this.isLoading.set(false);
            return of([]);
          })
        )
      ),
      takeUntilDestroyed(this.destroyRef) 
    ).subscribe(orders => {
      this.allOrders.set(orders);
      this.isLoading.set(false);
    });
  }

  onOpenStatusModal(order: OrderItem): void {
    this.selectedOrder.set(order);
    this.isModalOpen.set(true);
  }

  onCloseStatusModal(): void {
    if (this.isUpdatingStatus()) return; // ป้องกันการกดปิดขณะส่ง API
    this.isModalOpen.set(false);
    this.selectedOrder.set(null);
  }

  onSaveStatus(event: { id: string; payload: StatusFormPayload }): void {
    this.isUpdatingStatus.set(true);

    this.orderService.updateOrderStatus(event.id, event.payload.status).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (updatedOrder) => {
        this.allOrders.update(orders =>
          orders.map(item => 
            (item.orderNo === updatedOrder.orderNo || item.orderNo === event.id) 
              ? { ...item, status: updatedOrder.status } 
              : item
          )
        );

        this.isUpdatingStatus.set(false);
        this.onCloseStatusModal();
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.errorMessage.set(err.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        this.isUpdatingStatus.set(false);
      }
    });
  }

  onFilterChange(filters: OrderFilterState): void {
    this.filterState.set(filters);
    this.currentPage.set(1);
    this.triggerSearch();
  }

  onFilterReset(): void {
    this.filterState.set({ keyword: '',status: 'ทั้งหมด', startDate: '', endDate: '' });
    this.currentPage.set(1);
    this.triggerSearch();
  }

  onPageChange(newPage: number): void {
    this.currentPage.set(newPage);
  }
}
