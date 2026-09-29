import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { OrderItem } from '../models/order.model';
import { MOCK_ORDERS } from '../mocks/order.mock';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private isMockMode = true; 

 getOrders(query: string = ''): Observable<OrderItem[]> {
    if (this.isMockMode) {
      const trimmedQuery = query.trim().toLowerCase();
      const filtered = trimmedQuery
        ? MOCK_ORDERS.filter(item =>
            item.orderNo.toLowerCase().includes(trimmedQuery) ||
            item.shopName?.toLowerCase().includes(trimmedQuery) ||
            item.productName?.toLowerCase().includes(trimmedQuery)
          )
        : MOCK_ORDERS;

      return of(filtered).pipe(delay(400));
    }

    // Interceptor จะจัดการ Retry และ Error Handling ให้สะดวกรวดเร็ว
    return this.http.get<OrderItem[]>('/api/orders', { params: { search: query } });
  }

  /**
   * อัปเดตสถานะรายการสั่งซื้อ
   */
  updateOrderStatus(orderNo: string, newStatus: string): Observable<OrderItem> {
    if (this.isMockMode) {
      const targetOrder = MOCK_ORDERS.find(
        item => item.orderNo === orderNo || String(item.no) === orderNo
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