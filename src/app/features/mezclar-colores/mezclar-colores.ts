import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MezclarColoresService } from '../../core/services/mezclar-colores.service';

type Estado = 'idle' | 'ready' | 'set' | 'go' | 'mostrando' | 'mezclando' | 'resultado';

interface RGB {
  r: number;
  g: number;
  b: number;
}

const TIEMPO_MEMORIZAR = 5;
const DISTANCIA_MAXIMA = Math.sqrt(3 * 255 * 255);

@Component({
  selector: 'app-mezclar-colores',
  imports: [RouterLink],
  templateUrl: './mezclar-colores.html',
  styleUrl: './mezclar-colores.scss',
})
export class MezclarColores {
  private readonly service = inject(MezclarColoresService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly estado = signal<Estado>('idle');
  protected readonly colorObjetivo = signal<RGB | null>(null);
  protected readonly hue = signal(0);
  protected readonly saturation = signal(0);
  protected readonly brightness = signal(50);
  protected readonly tiempoRestante = signal(TIEMPO_MEMORIZAR);
  protected readonly puntaje = signal<number | null>(null);

  protected readonly colorMezclado = computed<RGB>(() =>
    this.hsvARgb(this.hue(), this.saturation(), this.brightness())
  );

  protected readonly cssObjetivo = computed(() => this.aCss(this.colorObjetivo()));
  protected readonly cssMezclado = computed(() => this.aCss(this.colorMezclado()));

  protected readonly gradienteSaturation = computed(() => {
    const gris = this.hsvARgb(this.hue(), 0, this.brightness());
    const puro = this.hsvARgb(this.hue(), 100, this.brightness());
    return `linear-gradient(to top, ${this.aCss(gris)} 0%, ${this.aCss(puro)} 100%)`;
  });

  protected readonly gradienteBrightness = computed(() => {
    const claro = this.hsvARgb(this.hue(), this.saturation(), 100);
    return `linear-gradient(to top, #000 0%, ${this.aCss(claro)} 100%)`;
  });

  private timeoutIds: number[] = [];
  private intervalId: number | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.limpiarTimers());
  }

  empezar(): void {
    this.limpiarTimers();
    this.puntaje.set(null);
    this.colorObjetivo.set(null);
    this.hue.set(0);
    this.saturation.set(0);
    this.brightness.set(50);
    this.tiempoRestante.set(TIEMPO_MEMORIZAR);

    this.estado.set('ready');
    this.timeoutIds.push(window.setTimeout(() => this.estado.set('set'), 1000));
    this.timeoutIds.push(window.setTimeout(() => this.estado.set('go'), 2000));
    this.timeoutIds.push(window.setTimeout(() => this.mostrarColor(), 3000));
  }

  actualizarHue(e: Event): void {
    this.hue.set(+(e.target as HTMLInputElement).value);
  }

  actualizarSaturation(e: Event): void {
    this.saturation.set(+(e.target as HTMLInputElement).value);
  }

  actualizarBrightness(e: Event): void {
    this.brightness.set(+(e.target as HTMLInputElement).value);
  }

  async confirmarMezcla(): Promise<void> {
    const objetivo = this.colorObjetivo();
    if (!objetivo) return;

    const mezcla = this.colorMezclado();
    const distancia = Math.sqrt(
      (objetivo.r - mezcla.r) ** 2 +
      (objetivo.g - mezcla.g) ** 2 +
      (objetivo.b - mezcla.b) ** 2
    );
    const puntajeBruto = 10 * (1 - distancia / DISTANCIA_MAXIMA);
    const puntajeCalculado = Math.round(puntajeBruto * 100) / 100;
    this.puntaje.set(puntajeCalculado);
    this.estado.set('resultado');

    try {
      await this.service.guardarPartida(puntajeCalculado);
    } catch (e) {
      console.error('No se pudo guardar la partida:', e);
    }
  }

  private mostrarColor(): void {
    this.colorObjetivo.set(this.generarColorRandom());
    this.estado.set('mostrando');
    this.tiempoRestante.set(TIEMPO_MEMORIZAR);

    const inicio = Date.now();
    this.intervalId = window.setInterval(() => {
      const elapsed = (Date.now() - inicio) / 1000;
      const restante = Math.max(0, TIEMPO_MEMORIZAR - elapsed);
      this.tiempoRestante.set(restante);
      if (restante <= 0) {
        this.detenerInterval();
        this.estado.set('mezclando');
      }
    }, 10);
  }

  private generarColorRandom(): RGB {
    return {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
    };
  }

  private hsvARgb(h: number, s: number, v: number): RGB {
    const sN = s / 100;
    const vN = v / 100;
    const c = vN * sN;
    const hh = h / 60;
    const x = c * (1 - Math.abs((hh % 2) - 1));
    let r1 = 0, g1 = 0, b1 = 0;
    if (hh < 1)      { r1 = c; g1 = x; b1 = 0; }
    else if (hh < 2) { r1 = x; g1 = c; b1 = 0; }
    else if (hh < 3) { r1 = 0; g1 = c; b1 = x; }
    else if (hh < 4) { r1 = 0; g1 = x; b1 = c; }
    else if (hh < 5) { r1 = x; g1 = 0; b1 = c; }
    else             { r1 = c; g1 = 0; b1 = x; }
    const m = vN - c;
    return {
      r: Math.round((r1 + m) * 255),
      g: Math.round((g1 + m) * 255),
      b: Math.round((b1 + m) * 255),
    };
  }

  private aCss(color: RGB | null): string {
    if (!color) return 'transparent';
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }

  private limpiarTimers(): void {
    this.timeoutIds.forEach(id => window.clearTimeout(id));
    this.timeoutIds = [];
    this.detenerInterval();
  }

  private detenerInterval(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
