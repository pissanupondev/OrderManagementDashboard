import { Routes } from "@angular/router";
import { OrderList } from "./containers/order-list/order-list";


export const ORDER_ROUTES: Routes = [
  {
    path: '',
    component: OrderList,
  },
];