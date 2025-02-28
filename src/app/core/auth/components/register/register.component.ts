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

@Component({
    selector: 'app-register',
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
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly sonnerService = inject(SonnerService);

  registerForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(30)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(30)]),
  });
  /** Hide or show password */
  isHidden = signal(true);
  isLoading = signal(false);
  
  public togglePassword(event: MouseEvent) {
    this.isHidden.set(!this.isHidden());
    event.stopPropagation();
  }

  public submit() {
    this.isLoading.set(true);
    const { email, password, confirmPassword } = this.registerForm.value;

    if (this.registerForm.valid && email && password && confirmPassword) {
      this.authService.register(email, password, confirmPassword).subscribe((res) => {
        if (res) {
          this.router.navigateByUrl("login");
        } else {
          this.sonnerService.errorToast("Invalid credentials");
        }
        this.isLoading.set(false);
      })
    }
  }
}
