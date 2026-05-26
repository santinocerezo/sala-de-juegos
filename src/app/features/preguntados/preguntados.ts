import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PreguntadosService } from '../../core/services/preguntados.service';
import { Pregunta } from '../../core/models/pregunta-trivia.model';

type Estado = 'cargando' | 'jugando' | 'terminado' | 'error';

const ESPERA_ENTRE_PREGUNTAS_MS = 1500;

@Component({
  selector: 'app-preguntados',
  imports: [RouterLink],
  templateUrl: './preguntados.html',
  styleUrl: './preguntados.scss',
})
export class Preguntados {
  private readonly service = inject(PreguntadosService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly estado = signal<Estado>('cargando');
  protected readonly mensajeError = signal('');
  protected readonly preguntas = signal<Pregunta[]>([]);
  protected readonly indiceActual = signal(0);
  protected readonly aciertos = signal(0);
  protected readonly respuestaSeleccionada = signal<string | null>(null);

  protected readonly preguntaActual = computed<Pregunta | null>(
    () => this.preguntas()[this.indiceActual()] ?? null
  );
  protected readonly total = computed(() => this.preguntas().length);
  protected readonly progreso = computed(
    () => `${this.indiceActual() + 1} / ${this.total()}`
  );

  private timeoutId: number | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.limpiarTimeout());
    this.iniciar();
  }

  async iniciar(): Promise<void> {
    this.limpiarTimeout();
    this.estado.set('cargando');
    this.mensajeError.set('');
    this.indiceActual.set(0);
    this.aciertos.set(0);
    this.respuestaSeleccionada.set(null);

    try {
      const preguntas = await this.service.cargarPreguntas();
      this.preguntas.set(preguntas);
      this.estado.set('jugando');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      this.mensajeError.set(msg);
      this.estado.set('error');
    }
  }

  responder(opcion: string): void {
    if (this.respuestaSeleccionada() !== null) return;
    const pregunta = this.preguntaActual();
    if (!pregunta) return;

    this.respuestaSeleccionada.set(opcion);
    if (opcion === pregunta.correcta) {
      this.aciertos.update(n => n + 1);
    }

    this.timeoutId = window.setTimeout(() => this.avanzar(), ESPERA_ENTRE_PREGUNTAS_MS);
  }

  esCorrecta(opcion: string): boolean {
    return opcion === this.preguntaActual()?.correcta;
  }

  esSeleccionada(opcion: string): boolean {
    return opcion === this.respuestaSeleccionada();
  }

  hayRespuesta(): boolean {
    return this.respuestaSeleccionada() !== null;
  }

  private avanzar(): void {
    const proximo = this.indiceActual() + 1;
    if (proximo >= this.total()) {
      this.terminar();
    } else {
      this.indiceActual.set(proximo);
      this.respuestaSeleccionada.set(null);
    }
  }

  private async terminar(): Promise<void> {
    this.estado.set('terminado');
    try {
      await this.service.guardarPartida(this.aciertos(), this.total());
    } catch (e) {
      console.error('No se pudo guardar la partida:', e);
    }
  }

  private limpiarTimeout(): void {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
