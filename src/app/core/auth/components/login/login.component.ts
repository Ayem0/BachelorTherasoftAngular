import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner'
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SonnerService } from '../../../../shared/services/sonner/sonner.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinner,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly sonnerService = inject(SonnerService);
  private readonly router = inject(Router);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(30)]),
  });
  /** Hide or show password signals */
  isHidden = signal(true);
  /** Loading when submitting form */
  isLoading = signal(false);
  
  /** Hide or show password */
  togglePassword(event: MouseEvent) {
    this.isHidden.set(!this.isHidden());
    event.stopPropagation();
  }

  /** Submit login form */
  public async submit() {
    this.isLoading.set(true);
    const { email, password } = this.loginForm.value;
    if (this.loginForm.valid && email && password) {
      this.authService.login(email, password).subscribe({
        next: (res) => {
          this.router.navigateByUrl("/calendar");
          this.isLoading.set(false);
        },
        error: (err) => {
          this.sonnerService.errorToast("Invalid credentials");
          this.isLoading.set(false);
        }
      })

    }
  }
}
