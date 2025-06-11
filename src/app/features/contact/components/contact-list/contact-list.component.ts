import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { User } from '../../../../core/auth/models/auth';
import { Workspace } from '../../../workspace/models/workspace';
import { ContactComponent } from '../contact/contact.component';

@Component({
  selector: 'app-contact-list',
  imports: [ContactComponent],
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactListComponent {
  public contacts = input.required<User[]>();
  public workspaces = input.required<Workspace[]>();
}
