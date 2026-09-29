export interface OrderItem {
  no: number;
  shopName: string;
  status: 'ชำระเงินแล้ว' | 'ส่งของแล้ว' | 'ยกเลิกคำสั่งซื้อ' | string;
  orderDate: string;
  orderNo: string;
  productName: string;
  variant: string;
  quantity: number;
  totalAmount: number;
  shippingFee: number;
  discount: number;
  netTotal: number;
}

export type OrderStatusType = 'ชำระเงินแล้ว' | 'ส่งของแล้ว' | 'ยกเลิกคำสั่งซื้อ' | 'ทั้งหมด' | string;

export interface OrderFilterState {
  status: OrderStatusType;
  startDate: string;
  endDate: string;
}

export interface StatusOption {
  value: string;
  label: string;
}

export interface StatusFormPayload {
  status: string;
  remark?: string;
}

export interface PaginationParams {
  search?: string;
  status?: string;
  page?: number;
}