import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { OrderItem, StatusFormPayload } from '../../models/order.model';
import { OrderStatusForm } from '../order-status-form/order-status-form';

@Component({
  imports: [CommonModule,OrderStatusForm],
  selector: 'app-order-status-modal',
  styleUrl: './order-status-modal.css',
  templateUrl: './order-status-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderStatusModal {
  @Input() isOpen: boolean = false;
  @Input() order: OrderItem | null = null;
  @Input() isLoading: boolean = false;

  @Output() save = new EventEmitter<{ id: string; payload: StatusFormPayload }>();
  @Output() close = new EventEmitter<void>();

  onFormSubmit(payload: StatusFormPayload): void {
    if (this.order) {
      this.save.emit({ id: this.order.orderNo, payload });
    }
  }

  onClose(): void {
    this.close.emit();
  }

}
