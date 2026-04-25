import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RolePermissionsMatrixComponent } from './role-permissions-matrix.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

describe('RolePermissionsMatrixComponent', () => {
  let component: RolePermissionsMatrixComponent;
  let fixture: ComponentFixture<RolePermissionsMatrixComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolePermissionsMatrixComponent, ReactiveFormsModule]
    }).compileComponents();

    fb = TestBed.inject(FormBuilder);
    fixture = TestBed.createComponent(RolePermissionsMatrixComponent);
    component = fixture.componentInstance;
    
    component.parentForm = fb.group({
      permissions: fb.array([
        fb.group({
          id_feature: ['f1'],
          view: [true],
          create: [false],
          delete: [false],
          activate: [false]
        })
      ])
    });
    component.features = [{ id: 'f1', name: 'Feature 1', description: 'Desc 1' }];
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return feature name and description', () => {
    expect(component.getFeatureName(0)).toBe('Feature 1');
    expect(component.getFeatureDescription(0)).toBe('Desc 1');
  });

  it('should return empty string if feature not found', () => {
    component.features = [];
    expect(component.getFeatureName(0)).toBe('');
    expect(component.getFeatureDescription(0)).toBe('');
  });
});
