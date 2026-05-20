import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { Modal } from '../../shared/components/modal/modal';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, Modal],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    edad: [null as number | null, [Validators.required, Validators.min(13)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly showPassword = signal(false);
  protected readonly cargando = signal(false);
  protected readonly mostrarError = signal(false);
  protected readonly mensajeError = signal('');

  get correo()   { return this.form.controls.correo; }
  get nombre()   { return this.form.controls.nombre; }
  get apellido() { return this.form.controls.apellido; }
  get edad()     { return this.form.controls.edad; }
  get password() { return this.form.controls.password; }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    try {
      const datos = this.form.getRawValue();
      await this.auth.register({
        correo: datos.correo,
        nombre: datos.nombre,
        apellido: datos.apellido,
        edad: datos.edad as number,
        password: datos.password,
      });
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
    if (mensaje.includes('User already registered') || mensaje.includes('already been registered')) {
      return 'Ya hay una cuenta registrada con ese correo.';
    }
    if (mensaje.includes('Password should be at least')) {
      return 'La contraseña no cumple con los requisitos mínimos.';
    }
    return 'No se pudo crear la cuenta. Probá de nuevo.';
  }
}
