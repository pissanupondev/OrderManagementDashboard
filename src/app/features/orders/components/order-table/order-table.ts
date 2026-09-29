import { ChangeDetectionStrategy, Component, input, Input, output } from '@angular/core';
import { OrderItem } from '../../models/order.model';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Pagination } from '../pagination/pagination';
import { ThaiDatePipe } from '../../../../shared/pipes/thai-date-pipe';

@Component({
  imports: [CommonModule, DecimalPipe,Pagination,ThaiDatePipe],
  standalone: true,
  selector: 'app-order-table',
  styleUrl: './order-table.css',
  templateUrl: './order-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderTable {
  orders = input<OrderItem[]>([]);
  isLoading = input<boolean>(false);

  currentPage = input<number>(1);
  totalPages = input<number>(1);

  pageChange = output<number>();
  
  editStatus = output<OrderItem>();

  getStatusClass(status: string): string {
    switch (status) {
      case 'ชำระเงินแล้ว':
        return 'bg-success text-white';
      case 'ส่งของแล้ว':
        return 'bg-info text-dark';
      default:
        return 'bg-secondary text-white';
    }
  }

  onSelectOrder(order: OrderItem): void {
    this.editStatus.emit(order);
  }
}