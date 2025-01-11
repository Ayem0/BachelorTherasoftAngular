import { AfterViewInit, Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { fromEvent, map } from 'rxjs';
import { SidebarService } from '../sidebar/sidebar.service';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { AuthService } from '../../auth/services/auth.service';
import { InitialLoginComponent } from "../../auth/components/initial-login/initial-login.component";
import { NgxSonnerToaster } from 'ngx-sonner';

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
  @ViewChild('leftSidebar') public leftSidebar!: MatSidenav;

  title = 'Agenda';

  private readonly sidebarService = inject(SidebarService);
  private readonly authService = inject(AuthService);

  public isLoggedIn = this.authService.isLoggedIn;
  public userFirstName = computed(() => this.authService.currentUserInfo()?.firstName);
  public windowWidth = signal<number>(0);
  public showOver = computed(() => this.windowWidth() < 1280);
  public sidenavMode = computed(() => this.showOver() ? 'over' : 'push');

  ngOnInit(): void {
    this.windowWidth.set(window.innerWidth)
    fromEvent(window, 'resize').pipe(
      map(() => window.innerWidth),
    ).subscribe(width => {
        this.windowWidth.set(width);
    });
  }


  public ngAfterViewInit(): void {
    this.sidebarService.setSideBar(this.leftSidebar);
  }

}
