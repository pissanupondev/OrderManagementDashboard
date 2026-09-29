import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { GlobalErrorService } from '../../../core/services/global-error.service';

export const errorRetryInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const globalErrorService = inject(GlobalErrorService);

  return next(req).pipe(
    // (ไม่ retry บน POST, PUT, PATCH, DELETE เพื่อป้องกันการส่งข้อมูลซ้ำ)
    retry({
      count: req.method === 'GET' ? 2 : 0, // ลองใหม่สูงสุด 2 ครั้ง
      delay: 1000                          // เว้นระยะห่าง 1 วินาที
    }),

    catchError((error: HttpErrorResponse) => {
      let userFriendlyMessage = 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง';

      if (error.status === 0) {
        userFriendlyMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
      } else if (error.status === 400) {
        userFriendlyMessage = error.error?.message || 'ข้อมูลที่ส่งไปไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
      } else if (error.status === 401) {
        userFriendlyMessage = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง';
      } else if (error.status === 403) {
        userFriendlyMessage = 'คุณไม่มีสิทธิ์เข้าถึงหรือดำเนินการในส่วนนี้';
      } else if (error.status === 404) {
        userFriendlyMessage = 'ไม่พบข้อมูลที่ระบุในระบบ';
      } else if (error.status >= 500) {
        userFriendlyMessage = 'ระบบเซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่ในภายหลัง';
      }
      
      globalErrorService.showError(userFriendlyMessage);

      return throwError(() => new Error(userFriendlyMessage));
    })
  );
};