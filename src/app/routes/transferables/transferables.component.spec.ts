import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferablesComponent } from './transferables.component';

describe('TransferablesComponent', () => {
  let component: TransferablesComponent;
  let fixture: ComponentFixture<TransferablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferablesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
