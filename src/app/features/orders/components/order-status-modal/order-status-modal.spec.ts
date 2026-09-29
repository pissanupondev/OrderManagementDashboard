import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderStatusModal } from './order-status-modal';

describe('OrderStatusModal', () => {
  let component: OrderStatusModal;
  let fixture: ComponentFixture<OrderStatusModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderStatusModal],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderStatusModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
