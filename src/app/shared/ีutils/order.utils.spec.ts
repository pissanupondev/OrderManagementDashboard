import { groupByKey, calculateTotalPrice, Order } from './order.utils';

describe('Order Utils (Pure Functions)', () => {
  // Mock Data สำหรับใช้ทดสอบ
  const mockOrders: Order[] = [
    { orderNumber: 'TH202102143', item: 'สินค้า A', price: 100 },
    { orderNumber: 'TH202011091', item: 'สินค้า B', price: 250 },
    { orderNumber: 'TH202011091', item: 'สินค้า C', price: 150 },
  ];

  /* -------------------------------------------------------------------------- */
  /* 1. Tests สำหรับ groupByKey                                                 */
  /* -------------------------------------------------------------------------- */
  describe('groupByKey', () => {
    it('ควรจัดกลุ่มข้อมูลตาม key (orderNumber) ได้อย่างถูกต้อง', () => {
      const result = groupByKey(mockOrders, 'orderNumber');

      // ตรวจสอบจำนวน Key ที่ได้
      expect(Object.keys(result).length).toBe(2);

      // ตรวจสอบข้อมูลในแต่ละกลุ่ม
      expect(result['TH202102143'].length).toBe(1);
      expect(result['TH202011091'].length).toBe(2);
      expect(result['TH202011091'][0].item).toBe('สินค้า B');
      expect(result['TH202011091'][1].item).toBe('สินค้า C');
    });

    it('ควรส่งคืน Object ว่าง ({}) เมื่อข้อมูลที่รับเข้ามาเป็น Array ว่าง', () => {
      const result = groupByKey([], 'orderNumber');
      expect(result).toEqual({});
    });

    it('ควรจัดกลุ่มด้วย Field อื่นๆ ได้ (เช่น price)', () => {
      const result = groupByKey(mockOrders, 'price');
      expect(result['100'].length).toBe(1);
      expect(result['250'].length).toBe(1);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 2. Tests สำหรับ calculateTotalPrice                                        */
  /* -------------------------------------------------------------------------- */
  describe('calculateTotalPrice', () => {
    it('ควรคำนวณราคารวมสุทธิได้อย่างถูกต้องเมื่อใช้ default key ("price")', () => {
      const total = calculateTotalPrice(mockOrders);
      // 100 + 250 + 150 = 500
      expect(total).toBe(500);
    });

    it('ควรคำนวณราคารวมได้ถูกต้องเมื่อระบุ custom priceKey', () => {
      const customItems = [
        { id: 1, totalAmount: 200 },
        { id: 2, totalAmount: 300.50 },
      ];

      const total = calculateTotalPrice(customItems, 'totalAmount');
      expect(total).toBe(500.50);
    });

    it('ควรคืนค่า 0 เมื่อส่ง Array ว่างเข้ามา', () => {
      const total = calculateTotalPrice([]);
      expect(total).toBe(0);
    });

    it('ควรข้ามหรือจัดการค่าที่ไม่ใช่ตัวเลข (null, undefined, invalid string) ได้โดยไม่เกิด Error', () => {
      const invalidItems = [
        { price: 100 },
        { price: null as any },
        { price: undefined as any },
        { price: 'abc' as any },
        { price: 50 },
      ];

      const total = calculateTotalPrice(invalidItems, 'price');
      // 100 + 0 + 0 + 0 + 50 = 150
      expect(total).toBe(150);
    });
  });
});