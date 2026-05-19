import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  readonly open = input.required<boolean>();
  readonly title = input<string>('Aviso');
  readonly message = input<string>('');

  readonly closed = output<void>();

  cerrar(): void {
    this.closed.emit();
  }
}
