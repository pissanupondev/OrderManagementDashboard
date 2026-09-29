import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { StatusFormPayload, StatusOption } from '../../models/order.model';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-order-status-form',
  styleUrl: './order-status-form.css',
  templateUrl: './order-status-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderStatusForm implements OnInit, OnChanges {
@Input({ required: true }) currentStatus: string = '';
  @Input() isLoading: boolean = false;
  @Input() statusOptions: StatusOption[] = [
    { value: 'pending', label: 'รอการจัดส่ง' },
    { value: 'shipped', label: 'จัดส่งแล้ว' },
    { value: 'delivered', label: 'สำเร็จ' },
    { value: 'cancelled', label: 'ยกเลิก' }
  ];

  @Output() formSubmit = new EventEmitter<StatusFormPayload>();
  @Output() formCancel = new EventEmitter<void>();

  form!: FormGroup;
  isSubmitted = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentStatus'] && this.form) {
      this.form.get('status')?.setValue(this.currentStatus);
      this.form.get('status')?.updateValueAndValidity();
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      status: [
        this.currentStatus, 
        [Validators.required, this.cannotBeSameStatus.bind(this)]
      ],
      remark: ['', [Validators.maxLength(200)]]
    });
  }

  private cannotBeSameStatus(control: AbstractControl): ValidationErrors | null {
    if (control.value && control.value.toLowerCase() === this.currentStatus?.toLowerCase()) {
      return { sameStatus: true };
    }
    return null;
  }

  get statusControl() { return this.form.get('status'); }
  get remarkControl() { return this.form.get('remark'); }

  onSubmit(): void {
    this.isSubmitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.formSubmit.emit(this.form.value as StatusFormPayload);
  }

  onCancel(): void {
    this.form.reset({ status: this.currentStatus, remark: '' });
    this.isSubmitted = false;
    this.formCancel.emit();
  }

}