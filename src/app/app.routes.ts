import { Routes } from '@angular/router';
import { RegisterComponent } from './core/auth/components/register/register.component';

export const routes: Routes = [
    { path: "", loadComponent: () => import('./core/layout/sidebar/sidebar.component').then(c => c.SidebarComponent) },
    { path: "calendar", loadComponent: () => import('./features/calendar/components/full-calendar/full-calendar.component').then(c => c.FullCalendarComponent) },
    { path: "login", loadComponent: () => import('./core/auth/components/login/login.component').then(c => c.LoginComponent) },
    { path: "register", loadComponent: () => import('./core/auth/components/register/register.component').then(c => c.RegisterComponent) }
];