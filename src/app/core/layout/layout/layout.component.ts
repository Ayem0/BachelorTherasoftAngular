import { AfterViewInit, Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { fromEvent, map } from 'rxjs';
import { SidebarService } from '../sidebar/sidebar.service';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { HeaderComponent } from '../header/header.component';
import { NavigationComponent } from '../navigation/navigation.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    NgxSonnerToaster,
    HeaderComponent,
    MatSidenavModule,
    NavigationComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements AfterViewInit, OnInit {
  @ViewChild('leftSidebar') public leftSidebar!: MatSidenav;

  title = 'BachelorTherasoftAngular';

  private readonly sidebarService = inject(SidebarService);

  public windowWidth = signal<number>(window.innerWidth);
  public showOver = computed(() => this.windowWidth() < 1280);
  public sidenavMode = computed(() => this.showOver() ? 'over' : 'push');

  public ngAfterViewInit(): void {
    this.sidebarService.setSideBar(this.leftSidebar);
  }

  public ngOnInit(): void {
    fromEvent(window, 'resize').pipe(
      map(() => window.innerWidth),
    ).subscribe(width => {
        this.windowWidth.set(width);
    });
  }
}
