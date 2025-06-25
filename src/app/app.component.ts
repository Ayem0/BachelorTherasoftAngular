import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LayoutComponent } from './core/layout/layout/layout.component';
import { LocaleService } from './shared/services/locale/locale.service';

@Component({
  selector: 'app-root',
  imports: [LayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly locale = inject(LocaleService);
}
