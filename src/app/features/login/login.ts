import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { Modal } from '../../shared/components/modal/modal';

interface UsuarioRapido {
  etiqueta: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Modal],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly showPassword = signal(false);
  protected readonly cargando = signal(false);
  protected readonly mostrarError = signal(false);
  protected readonly mensajeError = signal('');

  protected readonly usuariosRapidos: UsuarioRapido[] = [
    { etiqueta: 'Test 1', email: 'test1@test.com', password: 'test1234' },
    { etiqueta: 'Test 2', email: 'test2@test.com', password: 'test1234' },
    { etiqueta: 'Test 3', email: 'test3@test.com', password: 'test1234' },
  ];

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  loginRapido(usuario: UsuarioRapido): void {
    this.form.setValue({ email: usuario.email, password: usuario.password });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.login(email, password);
      await this.router.navigateByUrl('/');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      this.mensajeError.set(this.traducirError(msg));
      this.mostrarError.set(true);
    } finally {
      this.cargando.set(false);
    }
  }

  cerrarError(): void {
    this.mostrarError.set(false);
  }

  private traducirError(mensaje: string): string {
    if (mensaje.includes('Invalid login credentials')) {
      return 'Email o contraseña incorrectos.';
    }
    if (mensaje.includes('Email not confirmed')) {
      return 'Tenés que confirmar tu email antes de ingresar.';
    }
    return 'No se pudo iniciar sesión. Probá de nuevo.';
  }
}
