import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
    { path: "", loadComponent: () => import('./features/home/home.component').then(c => c.HomeComponent) },
    { path: "home", redirectTo: "" },
    { path: "login", loadComponent: () => import('./core/auth/components/login/login.component').then(c => c.LoginComponent) },
    { path: "register", loadComponent: () => import('./core/auth/components/register/register.component').then(c => c.RegisterComponent) },
    { 
        path: "calendar", 
        loadComponent: () => import('./features/calendar/components/full-calendar/full-calendar.component').then(c => c.FullCalendarComponent),
        canActivate: [authGuard]
    },
    { path: "**", loadComponent: () => import('./features/not-found/not-found.component').then(c => c.NotFoundComponent) },

];