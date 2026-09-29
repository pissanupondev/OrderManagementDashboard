import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export const errorRetryInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  
  return next(req).pipe(
    // 🟢 1. ทำ Retry เฉพาะ HTTP GET Request เมื่อมีปัญหาเครือข่าย หรือ Server 5xx (ไม่ retry บน POST, PATCH, DELETE)
    retry({
      count: req.method === 'GET' ? 2 : 0, // ลองใหม่ 2 ครั้ง
      delay: 1000 // เว้นระยะห่าง 1 วินาที
    }),

    // 🟢 2. Centralized Error Handling แปลง HTTP Error เป็นข้อความภาษาไทย
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

      // ส่งต่อ Error object ใหม่ที่มี message ภาษาไทย
      return throwError(() => new Error(userFriendlyMessage));
    })
  );
};