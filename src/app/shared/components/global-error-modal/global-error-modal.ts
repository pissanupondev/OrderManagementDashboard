import { Component, inject } from '@angular/core';
import { GlobalErrorService } from '../../../core/services/global-error.service';

@Component({
  imports: [],
  selector: 'app-global-error-modal',
  styleUrl: './global-error-modal.css',
  templateUrl: './global-error-modal.html',
})
export class GlobalErrorModal {
  protected errorService = inject(GlobalErrorService);

  onClose(): void {
    this.errorService.clearError();
  }
}
