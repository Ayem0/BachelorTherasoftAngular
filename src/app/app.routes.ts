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
        canActivate: [authGuard]
    },
    {
        path: "workspace/:id",
        loadComponent: () => import('./features/workspace/components/workspace-details/workspace-details.component').then(c => c.WorkspaceDetailsComponent),
        canActivate: [authGuard],
        loadChildren: () => [
            {
                path: "members",
                loadComponent: () => import('./features/location/components/location-list/location-list.component').then(c => c.LocationListComponent),
                canActivate: [authGuard]
            },
            {
                path: "locations",
                loadComponent: () => import('./features/location/components/location-list/location-list.component').then(c => c.LocationListComponent),
                canActivate: [authGuard]
            },
            {
                path: "participants",
                loadComponent: () => import('./features/participant/components/participant-list/participant-list.component').then(c => c.ParticipantListComponent),
                canActivate: [authGuard]
            },
            {
                path: "participant-categories",
                loadComponent: () => import('./features/participant-category/components/participant-category-list/participant-category-list.component')
                    .then(c => c.ParticipantCategoryListComponent),
                canActivate: [authGuard]
            },
            {
                path: "event-categories",
                loadComponent: () => import('./features/event-category/components/event-category-list/event-category-list.component').then(c => c.EventCategoryListComponent),
                canActivate: [authGuard]
            },
            {
                path: "roles",
                loadComponent: () => import('./features/workspace-role/components/workspace-role-list/workspace-role-list.component').then(c => c.WorkspaceRoleListComponent),
                canActivate: [authGuard]
            },
            {
                path: "slots",
                loadComponent: () => import('./features/slot/components/slot-list/slot-list.component').then(c => c.SlotListComponent),
                canActivate: [authGuard]
            },
            {
                path: "tags",
                loadComponent: () => import('./features/tag/components/tag-list/tag-list.component').then(c => c.TagListComponent),
                canActivate: [authGuard]
            },
            {
                path: "",
                redirectTo: 'members',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: "location/:id",
        loadComponent: () => import('./features/location/components/location-details/location-details.component').then(c => c.LocationDetailsComponent),
        canActivate: [authGuard]
    },
    {
        path: "role/:id",
        loadComponent: () => import('./features/workspace-role/components/workspace-role-details/workspace-role-details.component').then(c => c.WorkspaceRoleDetailsComponent),
        canActivate: [authGuard]
    },
    {
        path: "tag/:id",
        loadComponent: () => import('./features/tag/components/tag-details/tag-details.component').then(c => c.TagDetailsComponent),
        canActivate: [authGuard]
    },
    {
        path: "event-category/:id",
        loadComponent: () => import('./features/event-category/components/event-category-details/event-category-details.component').then(c => c.EventCategoryDetailsComponent),
        canActivate: [authGuard]
    },
    {
        path: "participant-category/:id",
        loadComponent: () => import('./features/participant-category/components/participant-category-details/participant-category-details.component').then(c => c.ParticipantCategoryDetailsComponent),
        canActivate: [authGuard]
    },
    {
        path: "participant/:id",
        loadComponent: () => import('./features/participant/components/participant-details/participant-details.component').then(c => c.ParticipantDetailsComponent),
        canActivate: [authGuard]
    },
    { path: "**", loadComponent: () => import('./features/not-found/not-found.component').then(c => c.NotFoundComponent) },

];