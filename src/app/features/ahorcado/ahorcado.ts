import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AhorcadoService } from '../../core/services/ahorcado.service';
import { Modal } from '../../shared/components/modal/modal';

const PALABRAS = [
  'ANGULAR', 'COMPONENTE', 'TYPESCRIPT', 'SUPABASE', 'BOOTSTRAP',
  'PROGRAMACION', 'JUEGO', 'AHORCADO', 'COMPUTADORA', 'TECLADO',
  'PANTALLA', 'AVELLANEDA', 'ARGENTINA', 'BUENOS', 'CODIGO',
];

const ABECEDARIO = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

const MAX_ERRORES = 6;

type EstadoJuego = 'jugando' | 'ganado' | 'perdido';

@Component({
  selector: 'app-ahorcado',
  imports: [RouterLink, Modal],
  templateUrl: './ahorcado.html',
  styleUrl: './ahorcado.scss',
})
export class Ahorcado {
  private readonly ahorcadoService = inject(AhorcadoService);

  protected readonly abecedario = ABECEDARIO;
  protected readonly maxErrores = MAX_ERRORES;

  protected readonly palabra = signal<string>('');
  protected readonly letrasAcertadas = signal<string[]>([]);
  protected readonly letrasFalladas = signal<string[]>([]);
  protected readonly mostrarFin = signal(false);
  private inicio = 0;

  protected readonly errores = computed(() => this.letrasFalladas().length);

  protected readonly estado = computed<EstadoJuego>(() => {
    if (this.errores() >= MAX_ERRORES) return 'perdido';
    const letrasUnicas = new Set(this.palabra().split(''));
    const adivinadas = new Set(this.letrasAcertadas());
    const completas = [...letrasUnicas].every(l => adivinadas.has(l));
    return completas && this.palabra() !== '' ? 'ganado' : 'jugando';
  });

  protected readonly palabraMostrada = computed(() => {
    return this.palabra()
      .split('')
      .map(letra => (this.letrasAcertadas().includes(letra) ? letra : '_'))
      .join(' ');
  });

  constructor() {
    this.nuevaPartida();
  }

  nuevaPartida(): void {
    const random = PALABRAS[Math.floor(Math.random() * PALABRAS.length)];
    this.palabra.set(random);
    this.letrasAcertadas.set([]);
    this.letrasFalladas.set([]);
    this.mostrarFin.set(false);
    this.inicio = Date.now();
  }

  seleccionarLetra(letra: string): void {
    if (this.estado() !== 'jugando') return;
    if (this.letraYaUsada(letra)) return;

    if (this.palabra().includes(letra)) {
      this.letrasAcertadas.update(arr => [...arr, letra]);
    } else {
      this.letrasFalladas.update(arr => [...arr, letra]);
    }

    if (this.estado() !== 'jugando') {
      this.terminarPartida();
    }
  }

  letraYaUsada(letra: string): boolean {
    return this.letrasAcertadas().includes(letra) || this.letrasFalladas().includes(letra);
  }

  cerrarFin(): void {
    this.mostrarFin.set(false);
  }

  private async terminarPartida(): Promise<void> {
    const duracion = Math.round((Date.now() - this.inicio) / 1000);
    try {
      await this.ahorcadoService.guardarPartida({
        palabra: this.palabra(),
        gano: this.estado() === 'ganado',
        letrasAcertadas: this.letrasAcertadas().length,
        letrasFalladas: this.letrasFalladas().length,
        duracionSegundos: duracion,
      });
    } catch (e) {
      console.error('No se pudo guardar la partida:', e);
    }
    this.mostrarFin.set(true);
  }
}
