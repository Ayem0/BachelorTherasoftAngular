import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { ContactService } from '../../services/contact.service';
import { ContactDialogComponent } from '../contact-dialog/contact-dialog.component';
import { ContactListComponent } from '../contact-list/contact-list.component';

@Component({
  selector: 'app-contact-layout',
  imports: [MatButtonModule, MatIcon, MatTooltip, ContactListComponent],
  templateUrl: './contact-layout.component.html',
  styleUrl: './contact-layout.component.scss',
})
export class ContactLayoutComponent implements OnInit {
  private readonly matDialog = inject(MatDialog);
  private readonly contactService = inject(ContactService);

  public contacts = this.contactService.contacts();
  public isLoading = signal(false);

  public async ngOnInit(): Promise<void> {
    this.isLoading.set(true);
    await this.contactService.getContacts();
    this.isLoading.set(false);
  }

  public openDialog(): void {
    this.matDialog.open(ContactDialogComponent, { hasBackdrop: true });
  }
}
