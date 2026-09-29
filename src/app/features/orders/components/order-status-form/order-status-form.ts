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
  @Input() isLoading = false;

  @Input() statusOptions: StatusOption[] = [
    { value: 'รอการจัดส่ง', label: 'รอการจัดส่ง' },
    { value: 'ชำระเงินแล้ว', label: 'ชำระเงินแล้ว' },
    { value: 'ส่งของแล้ว', label: 'ส่งของแล้ว' },
    { value: 'ยกเลิกคำสั่งซื้อ', label: 'ยกเลิกคำสั่งซื้อ' }
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
      const statusControl = this.form.get('status');

      statusControl?.setValue(this.currentStatus);
      statusControl?.updateValueAndValidity();
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      status: [
        this.currentStatus,
        [
          Validators.required,
          this.cannotBeSameStatus.bind(this)
        ]
      ],
      remark: [
        '',
        [Validators.maxLength(200)]
      ]
    });
  }

  private cannotBeSameStatus(
    control: AbstractControl
  ): ValidationErrors | null {

    if (
      control.value &&
      control.value.toLowerCase() === this.currentStatus?.toLowerCase()
    ) {
      return { sameStatus: true };
    }

    return null;
  }

  get statusControl(): AbstractControl | null {
    return this.form?.get('status') ?? null;
  }

  get remarkControl(): AbstractControl | null {
    return this.form?.get('remark') ?? null;
  }

  onSubmit(): void {
    this.isSubmitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmit.emit(this.form.value as StatusFormPayload);
  }

  onCancel(): void {
    this.form.reset({
      status: this.currentStatus,
      remark: ''
    });

    this.isSubmitted = false;
    this.formCancel.emit();
  }
}