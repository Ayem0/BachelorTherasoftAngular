import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { fromEvent, map } from 'rxjs';
import { SidebarService } from '../sidebar/sidebar.service';

@Component({
  selector: 'app-navigation',
  imports: [
    TranslateModule,
    MatIcon,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent implements OnInit {
  private readonly sidebarService = inject(SidebarService);

  public windowWidth = signal<number>(0);
  public showTitle = computed(() => this.windowWidth() < 1280);

  ngOnInit(): void {
    this.windowWidth.set(window.innerWidth);
    fromEvent(window, 'resize')
      .pipe(map(() => window.innerWidth))
      .subscribe((width) => {
        this.windowWidth.set(width);
      });
  }

  public toggleMenu() {
    this.sidebarService.toggleSideBar();
  }
}
