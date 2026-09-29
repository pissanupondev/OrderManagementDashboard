import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderStatusForm } from './order-status-form';

describe('OrderStatusForm', () => {
  let component: OrderStatusForm;
  let fixture: ComponentFixture<OrderStatusForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderStatusForm],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderStatusForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
