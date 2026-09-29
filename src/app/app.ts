import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalErrorModal } from './shared/components/global-error-modal/global-error-modal';

@Component({
  imports: [RouterOutlet,GlobalErrorModal],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('OrderManagementDashboard');
}
