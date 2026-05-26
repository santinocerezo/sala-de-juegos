import {
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ChatService } from '../../core/services/chat.service';
import { MensajeChat } from '../../core/models/mensaje-chat.model';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, RouterLink],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class Chat {
  private readonly chatService = inject(ChatService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly mensajes = signal<MensajeChat[]>([]);
  protected readonly nuevoTexto = signal('');
  protected readonly enviando = signal(false);
  protected readonly cargando = signal(true);

  private readonly contenedor = viewChild<ElementRef<HTMLDivElement>>('contenedorMensajes');

  constructor() {
    this.iniciar();

    effect(() => {
      this.mensajes();
      queueMicrotask(() => this.scrollAlFondo());
    });
  }

  esPropio(mensaje: MensajeChat): boolean {
    return mensaje.user_id === this.auth.user()?.id;
  }

  formatearHora(iso: string): string {
    const fecha = new Date(iso);
    return fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }

  async enviar(): Promise<void> {
    const texto = this.nuevoTexto().trim();
    if (!texto || this.enviando()) return;

    this.enviando.set(true);
    try {
      await this.chatService.enviar(texto);
      this.nuevoTexto.set('');
    } catch (e) {
      console.error('No se pudo enviar el mensaje:', e);
    } finally {
      this.enviando.set(false);
    }
  }

  private async iniciar(): Promise<void> {
    try {
      const iniciales = await this.chatService.cargarUltimosMensajes();
      this.mensajes.set(iniciales);
    } catch (e) {
      console.error('No se pudieron cargar los mensajes:', e);
    } finally {
      this.cargando.set(false);
    }

    const canal = this.chatService.suscribirANuevos(mensaje => {
      this.mensajes.update(arr => [...arr, mensaje]);
    });

    this.destroyRef.onDestroy(() => {
      canal.unsubscribe();
    });
  }

  private scrollAlFondo(): void {
    const el = this.contenedor()?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
