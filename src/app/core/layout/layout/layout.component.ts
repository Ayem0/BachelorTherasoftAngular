import { AfterViewInit, Component, computed, inject, viewChild } from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { InitialLoginComponent } from "../../auth/components/initial-login/initial-login.component";
import { AuthService } from '../../auth/services/auth.service';
import { HeaderComponent } from '../header/header.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { SidebarService } from '../sidebar/sidebar.service';
import { LayoutService } from './layout.service';

@Component({
    selector: 'app-layout',
    imports: [
    RouterOutlet,
    NgxSonnerToaster,
    HeaderComponent,
    MatSidenavModule,
    NavigationComponent,
    InitialLoginComponent
],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.scss'
})
export class LayoutComponent implements AfterViewInit {
  private readonly sidebarService = inject(SidebarService);
  private readonly authService = inject(AuthService);
  private readonly layoutService = inject(LayoutService);
  
  public leftSideBar = viewChild.required(MatSidenav);

  public isLoggedIn = this.authService.isLoggedIn;
  public userFirstName = computed(() => this.authService.currentUserInfo()?.firstName);
  public showOver = computed(() => this.layoutService.windowWidth() < 1280);
  public sidenavMode = computed(() => this.showOver() ? 'over' : 'push');


  public ngAfterViewInit(): void {
    this.sidebarService.setSideBar(this.leftSideBar());
  }

}
