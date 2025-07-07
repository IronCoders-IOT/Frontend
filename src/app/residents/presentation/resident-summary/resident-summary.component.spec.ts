import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResidentSummaryComponent } from './resident-summary.component';

describe('ResidentSummaryComponent', () => {
  let component: ResidentSummaryComponent;
  let fixture: ComponentFixture<ResidentSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidentSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResidentSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
