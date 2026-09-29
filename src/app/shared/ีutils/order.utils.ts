export interface Order {
  orderNumber: string;
  item: string;
  price: number;
}

export const groupByKey = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((acc, item) => {
    const groupKey = String(item[key]);
    return {
      ...acc,
      [groupKey]: [...(acc[groupKey] || []), item]
    };
  }, {} as Record<string, T[]>);
};

export const calculateTotalPrice = <T>(
  items: T[], 
  priceKey: keyof T = 'price' as keyof T
): number => {
  return items.reduce((sum, item) => {
    const value = Number(item[priceKey]) || 0;
    return sum + value;
  }, 0);
};