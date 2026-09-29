import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'orders',
    loadChildren: () => import('./features/orders/order.route').then(m => m.ORDER_ROUTES)
  },
  {
    path: '',
    redirectTo: 'orders',
    pathMatch: 'full'
  }
];