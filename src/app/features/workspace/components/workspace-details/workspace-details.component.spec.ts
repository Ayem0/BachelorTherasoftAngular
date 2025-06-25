import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { WorkspaceDetailsComponent } from './workspace-details.component';
describe('WorkspaceDetailsComponent', () => {
  let component: WorkspaceDetailsComponent;
  let fixture: ComponentFixture<WorkspaceDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
      imports: [WorkspaceDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkspaceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
