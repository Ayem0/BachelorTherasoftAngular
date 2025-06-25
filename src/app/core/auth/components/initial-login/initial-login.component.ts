import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { SonnerService } from '../../../../shared/services/sonner/sonner.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-initial-login',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinner,
  ],
  templateUrl: './initial-login.component.html',
  styleUrl: './initial-login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InitialLoginComponent {
  private readonly authService = inject(AuthService);
  private readonly sonnerService = inject(SonnerService);
  public isLoading = signal(false);

  public form = new FormGroup({
    firstName: new FormControl({ value: '', disabled: this.isLoading() }, [
      Validators.required,
    ]), // TODO add only A-z validators
    lastName: new FormControl({ value: '', disabled: this.isLoading() }, [
      Validators.required,
    ]),
  });

  public submit() {
    this.isLoading.set(true);
    const { firstName, lastName } = this.form.value;
    if (this.form.valid && firstName && lastName) {
      this.authService.updateUserInfo(firstName, lastName).subscribe((res) => {
        if (!res) {
          this.sonnerService.error('Error finializing registration');
        }
        this.isLoading.set(false);
      });
    }
  }
}
