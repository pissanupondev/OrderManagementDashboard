import { Component, computed, inject, signal } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { OrderFilterState, OrderItem, StatusFormPayload } from '../../models/order.model';
import { OrderTable } from '../../components/order-table/order-table';
import { CommonModule } from '@angular/common';
import { OrderFilter } from '../../components/order-filter/order-filter';
import { calculateTotalPrice, groupByKey } from '../../../../shared/ีutils/order.utils';
import { OrderStatusModal } from '../../components/order-status-modal/order-status-modal';

@Component({
  imports: [CommonModule,OrderTable,OrderFilter,OrderStatusModal],
  selector: 'app-order-list',
  styleUrl: './order-list.css',
  templateUrl: './order-list.html',
})
export class OrderList {
  private orderService = inject(OrderService);

  // 1. Raw Data จาก API
  allOrders = signal<OrderItem[]>([]);
  isLoading = signal<boolean>(true);

  // 2. Filter State
  filterState = signal<OrderFilterState>({
    status: 'ทั้งหมด',
    startDate: '',
    endDate: ''
  });

  // 3. Pagination State
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  // 4. Modal & Update Status State (ส่วนที่เพิ่มใหม่)
  isModalOpen = signal<boolean>(false);
  selectedOrder = signal<OrderItem | null>(null);
  isUpdatingStatus = signal<boolean>(false);

  // 5. Computed Properties ต่างๆ
  filteredOrders = computed(() => {
    const orders = this.allOrders();
    const { status, startDate, endDate } = this.filterState();

    return orders.filter(item => {
      const matchStatus = status === 'ทั้งหมด' || item.status === status;

      let matchDate = true;
      if (startDate || endDate) {
        const itemDate = new Date(item.orderDate).getTime();
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
    this.loadOrders();
  }

  // Handlers สำหรับ Modal & Status Update (ส่วนที่เพิ่มใหม่)
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

    this.orderService.updateOrderStatus(event.id, event.payload.status).subscribe({
      next: (updatedOrder) => {
        // อัปเดตข้อมูลใน Signal allOrders เพื่อให้ UI ล่าสุดแสดงผลทันที
        this.allOrders.update(orders =>
          orders.map(item => item.orderNo === updatedOrder.orderDate ? { ...item, status: updatedOrder.status } : item)
        );

        this.isUpdatingStatus.set(false);
        this.onCloseStatusModal();
      },
      error: (err) => {
        console.error('Error updating status:', err);
        alert(err.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        this.isUpdatingStatus.set(false);
      }
    });
  }

  // Handlers เดิม...
  onFilterChange(filters: OrderFilterState): void {
    this.filterState.set(filters);
    this.currentPage.set(1);
  }

  onFilterReset(): void {
    this.filterState.set({ status: 'ทั้งหมด', startDate: '', endDate: '' });
    this.currentPage.set(1);
  }

  onPageChange(newPage: number): void {
    this.currentPage.set(newPage);
  }

  private loadOrders(): void {
    this.isLoading.set(true);
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.allOrders.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading order list:', err);
        this.isLoading.set(false);
      }
    });
  }
}
