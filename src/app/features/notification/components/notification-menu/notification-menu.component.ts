import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { InvitationListComponent } from '../../../invitation/components/invitation-list/invitation-list.component';

@Component({
  selector: 'app-notification-menu',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatMenuModule,
    InvitationListComponent,
    MatTooltip,
    MatBadgeModule,
  ],
  templateUrl: './notification-menu.component.html',
  styleUrl: './notification-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationMenuComponent {}
