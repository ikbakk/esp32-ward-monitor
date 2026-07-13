import { inject } from '@angular/core';
import { Router, type CanActivateFn, type Routes } from '@angular/router';
import { AuthService } from './core/services/auth.service';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/auth/demo-login.component').then((m) => m.DemoLoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell.component').then((m) => m.ShellComponent),
    canActivate: [(() => {
      const auth = inject(AuthService);
      const router = inject(Router);

      if (auth.isAuthenticated()) {
        return true;
      }

      return router.createUrlTree(['/']);
    }) satisfies CanActivateFn],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'wards/:wardId',
        loadComponent: () => import('./features/wards/ward-detail.component').then((m) => m.WardDetailComponent),
      },
      {
        path: 'rooms/:roomId',
        loadComponent: () => import('./features/rooms/room-detail.component').then((m) => m.RoomDetailComponent),
      },
      {
        path: 'patients/:patientId',
        loadComponent: () => import('./features/patients/patient-detail.component').then((m) => m.PatientDetailComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
