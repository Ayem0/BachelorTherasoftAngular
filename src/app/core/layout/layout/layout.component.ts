import { AfterViewInit, Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { fromEvent, map } from 'rxjs';
import { InitialLoginComponent } from "../../auth/components/initial-login/initial-login.component";
import { AuthService } from '../../auth/services/auth.service';
import { HeaderComponent } from '../header/header.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { SidebarService } from '../sidebar/sidebar.service';

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
export class LayoutComponent implements AfterViewInit, OnInit {
  public leftSideBar = viewChild.required(MatSidenav);

  title = 'Agenda';

  private readonly sidebarService = inject(SidebarService);
  private readonly authService = inject(AuthService);

  public isLoggedIn = this.authService.isLoggedIn;
  public userFirstName = computed(() => this.authService.currentUserInfo()?.firstName);
  public windowWidth = signal<number>(window.innerWidth);
  public showOver = computed(() => this.windowWidth() < 1280);
  public sidenavMode = computed(() => this.showOver() ? 'over' : 'push');

  ngOnInit(): void {
    // this.windowWidth.set()
    fromEvent(window, 'resize').pipe(
      map(() => window.innerWidth),
    ).subscribe(width => {
        this.windowWidth.set(width);
    });
  }


  public ngAfterViewInit(): void {
    this.sidebarService.setSideBar(this.leftSideBar());
  }

}
