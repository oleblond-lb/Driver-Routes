export interface PreOrder {
  id: number;
  dispatchDate: string;
  customerId: number;
  customerName: string;
  sodId: number;
  descriptionMemo: string;
  entryTime: string;
  preOrdersHour: number;
  orderedUnits: number;
  unitType: number;
  unitSize: number;
  webAppPreOrderQVendorId: number;
  vendorId: number;
  vendorName: string;
  price: number;
  weight: number;
  createdBy: string;
  createdAt: string;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}
