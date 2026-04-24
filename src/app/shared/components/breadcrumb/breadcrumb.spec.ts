import { TestBed, ComponentFixture } from '@angular/core/testing';
import { BreadcrumbComponent } from './breadcrumb.component';
import { provideRouter, Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbComponent],
      providers: [
        provideRouter([
          { path: 'users/new', component: class {} },
          { path: 'products/update/:id', component: class {} },
          { path: 'unknown-path', component: class {} },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate breadcrumbs from URL', async () => {
    await router.navigateByUrl('/users/new');
    fixture.detectChanges();

    const crumbs = component.breadcrumbs();
    expect(crumbs.length).toBe(2);
    expect(crumbs[0].displayName).toBe('Usuários');
    expect(crumbs[1].displayName).toBe('Novo');
  });

  it('should handle "update" routes and hide the ID', async () => {
    await router.navigateByUrl('/products/update/123');
    fixture.detectChanges();

    const crumbs = component.breadcrumbs();
    expect(crumbs.length).toBe(2);
    expect(crumbs[0].displayName).toBe('Produtos');
    expect(crumbs[1].displayName).toBe('Editar');
  });

  it('should capitalize unknown route segments', async () => {
    await router.navigateByUrl('/unknown-path');
    fixture.detectChanges();

    const crumbs = component.breadcrumbs();
    expect(crumbs[0].displayName).toBe('Unknown-path');
  });
});
