import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarService } from '../sidebar/sidebar.service';
import { MatButtonModule } from '@angular/material/button';
import { fromEvent, map } from 'rxjs';

@Component({
    selector: 'app-navigation',
    imports: [
        MatIcon,
        RouterLink,
        RouterLinkActive,
        MatButtonModule
    ],
    templateUrl: './navigation.component.html',
    styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements OnInit {
 
  private readonly sidebarService = inject(SidebarService);
  
  public windowWidth = signal<number>(0);
  public showTitle = computed(() => this.windowWidth() < 1280);

  ngOnInit(): void {
    this.windowWidth.set(window.innerWidth)
    fromEvent(window, 'resize').pipe(
      map(() => window.innerWidth),
    ).subscribe(width => {
        this.windowWidth.set(width);
    });
  }

  public toggleMenu() {
    this.sidebarService.toggleSideBar();
  }
}
