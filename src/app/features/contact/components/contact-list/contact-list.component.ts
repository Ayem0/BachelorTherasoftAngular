import { Component, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { User } from '../../../../core/auth/models/auth';
import { ContactComponent } from '../contact/contact.component';

@Component({
  selector: 'app-contact-list',
  imports: [ContactComponent, MatProgressSpinner],
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.scss',
})
export class ContactListComponent {
  public contacts = input.required<User[]>();
  public isLoading = input.required<boolean>();
}
