import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AppRoutingModule } from './app.routing';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { FeaturesModule } from './modules/features/features.module';

describe('AppRoutingModule', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, AppRoutingModule]
    });
  });

  it('should create AppRoutingModule', () => {
    const module = TestBed.inject(AppRoutingModule);
    expect(module).toBeTruthy();
  });

  it('should load authentication module via loadChildren', async () => {
    const router = TestBed.inject(Router);
    const authRoute = router.config.find(r => r.children && r.children[0] && r.children[0].loadChildren && r.path === '');
    // Specifically check the route with authentication children
    const routesWithChildren = router.config.filter(r => r.children && r.children[0] && r.children[0].loadChildren);
    expect(routesWithChildren.length).toBeGreaterThanOrEqual(2);

    const authLoadChildren = routesWithChildren[0].children![0].loadChildren as Function;
    const authMod = await authLoadChildren();
    expect(authMod).toBe(AuthenticationModule);

    const featLoadChildren = routesWithChildren[1].children![0].loadChildren as Function;
    const featMod = await featLoadChildren();
    expect(featMod).toBe(FeaturesModule);
  });
});
