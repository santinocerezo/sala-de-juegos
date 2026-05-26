import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MayorMenorService } from '../../core/services/mayor-menor.service';
import { Modal } from '../../shared/components/modal/modal';

type Palo = 'corazones' | 'diamantes' | 'treboles' | 'picas';

interface Carta {
  valor: number;
  palo: Palo;
}

const PALOS: Palo[] = ['corazones', 'diamantes', 'treboles', 'picas'];

@Component({
  selector: 'app-mayor-menor',
  imports: [RouterLink, Modal],
  templateUrl: './mayor-menor.html',
  styleUrl: './mayor-menor.scss',
})
export class MayorMenor {
  private readonly mayorMenorService = inject(MayorMenorService);

  private readonly mazo = signal<Carta[]>([]);
  protected readonly cartaAnterior = signal<Carta | null>(null);
  protected readonly cartaActual = signal<Carta | null>(null);
  protected readonly aciertos = signal(0);
  protected readonly jugando = signal(true);
  protected readonly mostrarFin = signal(false);
  protected readonly mensajeFin = signal('');

  protected readonly cartasRestantes = computed(() => this.mazo().length);

  constructor() {
    this.nuevaPartida();
  }

  nuevaPartida(): void {
    const mazoNuevo = this.generarMazoMezclado();
    const primera = mazoNuevo.shift()!;
    this.mazo.set(mazoNuevo);
    this.cartaAnterior.set(null);
    this.cartaActual.set(primera);
    this.aciertos.set(0);
    this.jugando.set(true);
    this.mostrarFin.set(false);
  }

  jugar(eleccion: 'mayor' | 'menor'): void {
    if (!this.jugando()) return;

    const mazoActual = this.mazo();
    if (mazoActual.length === 0) return;

    const proxima = mazoActual[0];
    const actual = this.cartaActual()!;

    const acerto = eleccion === 'mayor'
      ? proxima.valor > actual.valor
      : proxima.valor < actual.valor;

    if (acerto) {
      this.aciertos.update(n => n + 1);
      this.cartaAnterior.set(actual);
      this.cartaActual.set(proxima);
      this.mazo.update(m => m.slice(1));

      if (this.mazo().length === 0) {
        this.terminar('¡Increíble! Acertaste todas las cartas del mazo.');
      }
    } else {
      this.terminar(
        `Fallaste. La carta era ${this.nombreValor(proxima.valor)} y elegiste ${eleccion}.`
      );
    }
  }

  nombreValor(valor: number): string {
    if (valor === 1) return 'A';
    if (valor === 11) return 'J';
    if (valor === 12) return 'Q';
    if (valor === 13) return 'K';
    return valor.toString();
  }

  iconoPalo(palo: Palo): string {
    switch (palo) {
      case 'corazones': return 'bi-suit-heart-fill';
      case 'diamantes': return 'bi-suit-diamond-fill';
      case 'treboles':  return 'bi-suit-club-fill';
      case 'picas':     return 'bi-suit-spade-fill';
    }
  }

  esPaloRojo(palo: Palo): boolean {
    return palo === 'corazones' || palo === 'diamantes';
  }

  cerrarFin(): void {
    this.mostrarFin.set(false);
  }

  private generarMazoMezclado(): Carta[] {
    const mazo: Carta[] = [];
    for (const palo of PALOS) {
      for (let valor = 1; valor <= 13; valor++) {
        mazo.push({ valor, palo });
      }
    }
    for (let i = mazo.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
    }
    return mazo;
  }

  private async terminar(mensaje: string): Promise<void> {
    this.jugando.set(false);
    this.mensajeFin.set(mensaje);
    try {
      await this.mayorMenorService.guardarPartida(this.aciertos());
    } catch (e) {
      console.error('No se pudo guardar la partida:', e);
    }
    this.mostrarFin.set(true);
  }
}
