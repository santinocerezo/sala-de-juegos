import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  ResultadosService,
  RankingAhorcado,
  RankingMayorMenor,
  RankingMezclarColores,
  RankingPreguntados,
} from '../../core/services/resultados.service';

@Component({
  selector: 'app-resultados',
  imports: [RouterLink],
  templateUrl: './resultados.html',
  styleUrl: './resultados.scss',
})
export class Resultados {
  private readonly service = inject(ResultadosService);

  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  protected readonly ahorcado = signal<RankingAhorcado[]>([]);
  protected readonly mayorMenor = signal<RankingMayorMenor[]>([]);
  protected readonly mezclarColores = signal<RankingMezclarColores[]>([]);
  protected readonly preguntados = signal<RankingPreguntados[]>([]);

  constructor() {
    this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set('');
    try {
      const [a, m, c, p] = await Promise.all([
        this.service.cargarRankingAhorcado(),
        this.service.cargarRankingMayorMenor(),
        this.service.cargarRankingMezclarColores(),
        this.service.cargarRankingPreguntados(),
      ]);
      this.ahorcado.set(a);
      this.mayorMenor.set(m);
      this.mezclarColores.set(c);
      this.preguntados.set(p);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      this.error.set('No se pudieron cargar los resultados: ' + msg);
    } finally {
      this.cargando.set(false);
    }
  }

  formatearFecha(iso: string | undefined): string {
    if (!iso) return '-';
    const fecha = new Date(iso);
    return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
