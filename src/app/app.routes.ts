import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { unauthGuard } from './core/auth/guards/unauth.guard';

export const routes: Routes = [
    { 
        path: "", 
        loadComponent: () => import('./features/home/home.component').then(c => c.HomeComponent)
    },
    { 
        path: "login", 
        loadComponent: () => import('./core/auth/components/login/login.component').then(c => c.LoginComponent),
        canActivate: [unauthGuard]
    },
    { 
        path: "register", 
        loadComponent: () => import('./core/auth/components/register/register.component').then(c => c.RegisterComponent),
        canActivate: [unauthGuard]
    },
    {
        path: "calendar",
        loadComponent: () => import('./features/calendar/components/full-calendar/full-calendar.component').then(c => c.FullCalendarComponent),
        canActivate: [authGuard]
    },
    {
        path: "workspace",
        loadComponent: () => import('./features/workspace/components/workspace-list/workspace-list.component').then(c => c.WorkspaceListComponent),
        canActivate: [authGuard],
    },
    {
        path: "workspace/:id",
        loadComponent: () => import('./features/workspace/components/workspace-details/workspace-details.component').then(c => c.WorkspaceDetailsComponent),
        canActivate: [authGuard]
    },
    { path: "**", loadComponent: () => import('./features/not-found/not-found.component').then(c => c.NotFoundComponent) },

];