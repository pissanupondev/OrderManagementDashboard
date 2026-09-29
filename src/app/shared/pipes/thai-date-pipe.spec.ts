import { ThaiDatePipe } from './thai-date-pipe'; // หรือปรับ path ตามชื่อไฟล์ของคุณ เช่น './thai-date.pipe'

describe('ThaiDatePipe', () => {
  let pipe: ThaiDatePipe;

  beforeEach(() => {
    pipe = new ThaiDatePipe();
  });

  it('ควรสร้าง Pipe Instance ได้สำเร็จ', () => {
    expect(pipe).toBeTruthy();
  });

  describe('กรณีข้อมูล Input ไม่ถูกต้อง (Falsy & Invalid Values)', () => {
    it('ควรคืนค่า "-" เมื่อ value เป็น null', () => {
      expect(pipe.transform(null)).toBe('-');
    });

    it('ควรคืนค่า "-" เมื่อ value เป็น undefined', () => {
      expect(pipe.transform(undefined)).toBe('-');
    });

    it('ควรคืนค่า "-" เมื่อ value เป็น string ว่าง', () => {
      expect(pipe.transform('')).toBe('-');
    });

    it('ควรคืนค่า "-" เมื่อ value ไม่สามารถแปลงเป็นวันที่ได้ (Invalid Date)', () => {
      expect(pipe.transform('invalid-date-string')).toBe('-');
    });
  });

  describe('กรณีแปลงวันที่รวมเวลา (includeTime = true)', () => {
    it('ควรฟอร์แมตวันที่แบบ Date Object เป็น พ.ศ. และเวลาได้ถูกต้อง', () => {
      // 29 ก.ย. ค.ศ. 2026 + 543 = พ.ศ. 2569 (Note: Month ใน JS Date เป็น 0-indexed โดย 8 = กันยายน)
      const inputDate = new Date(2026, 8, 29, 13, 30);
      const result = pipe.transform(inputDate, true);

      expect(result).toBe('29/09/2569 13:30 น.');
    });

    it('ควรใช้ค่าเริ่มต้น includeTime = true เมื่อไม่ได้ระบุ parameter ที่สอง', () => {
      const inputDate = new Date(2026, 8, 29, 13, 30);
      const result = pipe.transform(inputDate);

      expect(result).toBe('29/09/2569 13:30 น.');
    });

    it('ควรใส่เลข 0 นำหน้า (padStart) กรณี วัน/เดือน/ชั่วโมง/นาที มีเลขหลักเดียว', () => {
      const inputDate = new Date(2025, 0, 5, 8, 5); // 5 ม.ค. 2025 08:05 น.
      const result = pipe.transform(inputDate, true);

      expect(result).toBe('05/01/2568 08:05 น.');
    });

    it('ควรทำงานได้ถูกต้องเมื่อส่งค่าเป็น Timestamp (number)', () => {
      const timestamp = new Date(2026, 8, 29, 10, 0).getTime();
      const result = pipe.transform(timestamp, true);

      expect(result).toBe('29/09/2569 10:00 น.');
    });

    it('ควรทำงานได้ถูกต้องเมื่อส่งค่าเป็น ISO Date String', () => {
      const dateString = '2026-09-29T13:30:00';
      const result = pipe.transform(dateString, true);

      // ตรวจสอบโครงสร้างคำตอบด้วย Regex เพื่อป้องกันเรื่อง Timezone Offset
      expect(result).toMatch(/^\d{2}\/\d{2}\/2569 \d{2}:\d{2} น\.$/);
    });
  });

  describe('กรณีแปลงเฉพาะวันที่ ไม่รวมเวลา (includeTime = false)', () => {
    it('ควรฟอร์แมตเฉพาะวันที่ วว/ดด/ปปปป (พ.ศ.) โดยไม่มีเวลาและ "น."', () => {
      const inputDate = new Date(2026, 8, 29, 13, 30);
      const result = pipe.transform(inputDate, false);

      expect(result).toBe('29/09/2569');
    });

    it('ควรรองรับการแปลง ISO Date String เมื่อกำหนด includeTime เป็น false', () => {
      const dateString = '2024-12-31T23:59:59';
      const result = pipe.transform(dateString, false);

      expect(result).toBe('31/12/2567');
    });
  });
});