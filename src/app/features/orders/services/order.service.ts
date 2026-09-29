import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { OrderItem } from '../models/order.model';
import { MOCK_ORDERS } from '../mocks/order.mock';

@Injectable({
  providedIn: 'root'
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

  updateOrderStatus(orderNo: string, newStatus: string): Observable<OrderItem> {
    if (this.isMockMode) {
      const targetOrder = MOCK_ORDERS.find(item => item.orderNo === orderNo || String(item.no) === orderNo);
      
      if (targetOrder) {
        targetOrder.status = newStatus;
        return of({ ...targetOrder }).pipe(delay(500));
      }
      
      throw new Error('ไม่พบรายการสั่งซื้อที่ระบุ');
    }

    // กรณีต่อกับ API จริง (ปรับ URL ตามโครงสร้าง Backend ของคุณ)
    return this.http.patch<OrderItem>(`/api/orders/${orderNo}/status`, { status: newStatus });
  }
}