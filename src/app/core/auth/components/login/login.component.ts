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
    selector: 'app-login',
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

  isHidden = signal(true);
  isLoading = signal(false);

  loginForm = new FormGroup({
    email: new FormControl({ value: "", disabled: this.isLoading() }, [Validators.required, Validators.email]),
    password: new FormControl({ value: "", disabled: this.isLoading() }, [Validators.required, Validators.minLength(10), Validators.maxLength(30)]),
  });

  togglePassword(event: MouseEvent) {
    this.isHidden.set(!this.isHidden());
    event.stopPropagation();
  }

  public submit() {
    this.isLoading.set(true);
    const { email, password } = this.loginForm.value;
    if (this.loginForm.valid && email && password) {
      this.authService.login(email, password).subscribe((res) => {
        if (res) {
          this.router.navigateByUrl("");
        } else {
          this.sonnerService.errorToast("Invalid credentials");
        }
        this.isLoading.set(false);
      })
    }
  }
}
