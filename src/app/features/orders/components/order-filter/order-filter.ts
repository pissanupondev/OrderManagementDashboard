import { Component, input, output } from '@angular/core';
import { OrderFilterState, OrderStatusType } from '../../models/order.model';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-order-filter',
  styleUrl: './order-filter.css',
  templateUrl: './order-filter.html',
})
export class OrderFilter {
  statusOptions = input<OrderStatusType[]>([
    'ทั้งหมด',
    'ชำระเงินแล้ว',
    'ส่งของแล้ว',
    'ยกเลิกคำสั่งซื้อ'
  ]);

  filterChange = output<OrderFilterState>();
  resetFilter = output<void>();

  keyword = '';
  selectedStatus: OrderStatusType = 'ทั้งหมด';
  startDate = '';
  endDate = '';

  onSearch(): void {
    this.filterChange.emit({
      keyword: this.keyword,
      status: this.selectedStatus,
      startDate: this.startDate,
      endDate: this.endDate
    });
  }

  onReset(): void {
    this.keyword = '';
    this.selectedStatus = 'ทั้งหมด';
    this.startDate = '';
    this.endDate = '';
    this.onSearch();
    this.resetFilter.emit();
  }
}
