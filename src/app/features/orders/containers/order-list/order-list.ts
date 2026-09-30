import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { OrderFilterState, OrderItem, StatusFormPayload } from '../../models/order.model';
import { OrderTable } from '../../components/order-table/order-table';
import { CommonModule } from '@angular/common';
import { OrderFilter } from '../../components/order-filter/order-filter';
import { calculateTotalPrice, groupByKey } from '../../../../shared/ีutils/order.utils';
import { OrderStatusModal } from '../../components/order-status-modal/order-status-modal';
import { FormControl } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  imports: [CommonModule,OrderTable,OrderFilter,OrderStatusModal],
  selector: 'app-order-list',
  styleUrl: './order-list.css',
  templateUrl: './order-list.html',
})
export class OrderList implements OnInit{
 private orderService = inject(OrderService);
  private destroyRef = inject(DestroyRef);

  searchControl = new FormControl('');

  allOrders = signal<OrderItem[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  filterState = signal<OrderFilterState>({
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
    const { status, startDate, endDate } = this.filterState();

    return orders.filter(item => {
      const matchStatus = status === 'ทั้งหมด' || item.status === status;

      let matchDate = true;
      if (startDate || endDate) {
        const itemDate = new Date(item.orderDate || '').getTime();
        const start = startDate ? new Date(startDate).getTime() : -Infinity;
        const end = endDate ? new Date(endDate).getTime() : Infinity;
        
        matchDate = itemDate >= start && itemDate <= end;
      }

      return matchStatus && matchDate;
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

  groupedDisplayedOrders = computed(() => {
    return groupByKey(this.displayedOrders(), 'orderNo'); 
  });

  totalNetAmount = computed(() => {
    return calculateTotalPrice(this.filteredOrders(), 'totalAmount');
  });

  pageNetAmount = computed(() => {
    return calculateTotalPrice(this.displayedOrders(), 'totalAmount');
  });

  ngOnInit(): void {
    // this.initSearchStream();
    this.loadOrders();
  }

  private initSearchStream(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => {
        this.isLoading.set(true);
        this.errorMessage.set('');
      }),
      switchMap(query => 
        this.orderService.getOrders().pipe(
          catchError(err => {
            this.errorMessage.set(err.message || 'ไม่สามารถโหลดข้อมูลได้');
            return of([]); // คืน Array ว่างเพื่อไม่ให้ Stream พัง
          })
        )
      ),
      tap(() => this.isLoading.set(false)),
      takeUntilDestroyed(this.destroyRef) 
    ).subscribe(data => {
      this.allOrders.set(data);
      this.currentPage.set(1); 
    });
  }

  private loadOrders(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.orderService.getOrders().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => {
        this.allOrders.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading order list:', err);
        this.errorMessage.set(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
        this.isLoading.set(false);
      }
    });
  }

  // Handlers สำหรับ Modal & Status Update
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
  }

  onFilterReset(): void {
    this.filterState.set({ status: 'ทั้งหมด', startDate: '', endDate: '' });
    this.searchControl.setValue('', { emitEvent: false });
    this.currentPage.set(1);
    this.loadOrders();
  }

  onPageChange(newPage: number): void {
    this.currentPage.set(newPage);
  }
}
