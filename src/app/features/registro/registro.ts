import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Modal } from '../../shared/components/modal/modal';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, Modal],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    edad: [null as number | null, [Validators.required, Validators.min(13)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly showPassword = signal(false);
  protected readonly mostrarModal = signal(false);

  get correo()   { return this.form.controls.correo; }
  get nombre()   { return this.form.controls.nombre; }
  get apellido() { return this.form.controls.apellido; }
  get edad()     { return this.form.controls.edad; }
  get password() { return this.form.controls.password; }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
  }
}
