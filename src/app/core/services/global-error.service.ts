import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorService {
  // 🟢 Signal เก็บข้อความ Error (เริ่มต้นเป็น null)
  readonly errorMessage = signal<string | null>(null);

  // 🟢 Signal เก็บสถานะเปิด/ปิด Modal (เริ่มต้นเป็น false)
  readonly isOpen = signal<boolean>(false);

  /**
   * เปิด Popup แสดงข้อความ Error
   * @param message ข้อความแจ้งเตือนภาษาไทยที่จะแสดงบน Modal
   */
  showError(message: string): void {
    this.errorMessage.set(message);
    this.isOpen.set(true);
  }

  /**
   * ปิด Popup และคืนค่า State เป็นค่าเริ่มต้น
   */
  clearError(): void {
    this.isOpen.set(false);
    this.errorMessage.set(null);
  }
}