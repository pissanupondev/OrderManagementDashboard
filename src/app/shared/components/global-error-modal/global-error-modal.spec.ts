import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalErrorModal } from './global-error-modal';

describe('GlobalErrorModal', () => {
  let component: GlobalErrorModal;
  let fixture: ComponentFixture<GlobalErrorModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalErrorModal],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalErrorModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
