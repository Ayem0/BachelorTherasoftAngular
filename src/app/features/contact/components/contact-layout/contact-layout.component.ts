import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { ContactStore } from '../../services/contact.store';
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
  private readonly contactStore = inject(ContactStore);
  public contacts = this.contactStore.contacts;
  public isLoading = this.contactStore.isLoading;

  public ngOnInit(): void {
    this.contactStore.getContacts();
  }

  public openDialog() {
    this.matDialog.open(ContactDialogComponent, { hasBackdrop: true });
  }
}
