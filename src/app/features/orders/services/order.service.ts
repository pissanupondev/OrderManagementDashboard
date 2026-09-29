import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { OrderItem, PaginationParams } from '../models/order.model';
import { MOCK_ORDERS } from '../mocks/order.mock';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private isMockMode = true;

  getOrders(): Observable<OrderItem[]> {
    if (this.isMockMode) {
      return of(MOCK_ORDERS).pipe(delay(400));
    }
    return this.http.get<OrderItem[]>('/api/orders');
  }

  getOrdersByParam(params: PaginationParams = {}): Observable<OrderItem[]> {
    const { search = '', status = '', page = 1 } = params;

    if (this.isMockMode) {
      const trimmedQuery = search.trim().toLowerCase();
      const pageSize = 10;

      const filtered = MOCK_ORDERS.filter((item) => {
        const matchesSearch =
          !trimmedQuery ||
          item.orderNo?.toLowerCase().includes(trimmedQuery) ||
          item.shopName?.toLowerCase().includes(trimmedQuery) ||
          item.productName?.toLowerCase().includes(trimmedQuery);

        const matchesStatus = !status || item.status === status;

        return matchesSearch && matchesStatus;
      });

      const startIndex = (page - 1) * pageSize;
      const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

      return of(paginatedItems).pipe(delay(400));
    }

    return this.http.get<OrderItem[]>('/api/orders', {
      params: {
        search,
        status,
        page: page.toString(),
      },
    });
  }

  updateOrderStatus(orderNo: string, newStatus: string): Observable<OrderItem> {
    if (this.isMockMode) {
      const targetOrder = MOCK_ORDERS.find(
        (item) => item.orderNo === orderNo || String(item.no) === orderNo,
      );

      if (targetOrder) {
        targetOrder.status = newStatus;
        return of({ ...targetOrder }).pipe(delay(500));
      }

      return throwError(() => new Error('ไม่พบรายการสั่งซื้อที่ระบุ'));
    }

    return this.http.patch<OrderItem>(`/api/orders/${orderNo}/status`, { status: newStatus });
  }
}
