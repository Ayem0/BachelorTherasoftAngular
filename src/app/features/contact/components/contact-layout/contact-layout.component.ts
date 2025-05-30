import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { ContactService } from '../../services/contact.service';
import { ContactDialogComponent } from '../contact-dialog/contact-dialog.component';
import { ContactListComponent } from '../contact-list/contact-list.component';

@Component({
  selector: 'app-contact-layout',
  imports: [
    MatButtonModule,
    MatIcon,
    MatTooltip,
    ContactListComponent,
    TranslateModule,
  ],
  templateUrl: './contact-layout.component.html',
  styleUrl: './contact-layout.component.scss',
})
export class ContactLayoutComponent implements OnInit {
  private readonly matDialog = inject(MatDialog);
  private readonly contactService = inject(ContactService);
  private readonly workspaceService = inject(WorkspaceService);

  public contacts = this.contactService.contacts();
  public workspaces = this.workspaceService.workspaces();
  public isLoading = signal(false);

  public ngOnInit(): void {
    this.isLoading.set(true);
    forkJoin([
      this.contactService.getContacts(),
      this.workspaceService.getWorkspaces(),
    ]).subscribe(() => this.isLoading.set(false));
  }

  public openDialog(): void {
    this.matDialog.open(ContactDialogComponent, { hasBackdrop: true });
  }
}
