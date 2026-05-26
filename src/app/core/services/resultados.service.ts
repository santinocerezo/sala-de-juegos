import { Injectable, inject } from '@angular/core';

import { SupabaseService } from './supabase.service';
import { PartidaAhorcado } from '../models/partida-ahorcado.model';
import { PartidaMayorMenor } from '../models/partida-mayor-menor.model';
import { PartidaMezclarColores } from '../models/partida-mezclar-colores.model';
import { PartidaPreguntados } from '../models/partida-preguntados.model';

const LIMITE_FILAS = 10;

export type RankingAhorcado       = PartidaAhorcado       & { nombre: string };
export type RankingMayorMenor     = PartidaMayorMenor     & { nombre: string };
export type RankingMezclarColores = PartidaMezclarColores & { nombre: string };
export type RankingPreguntados    = PartidaPreguntados    & { nombre: string };

@Injectable({ providedIn: 'root' })
export class ResultadosService {
  private readonly supabase = inject(SupabaseService);

  async cargarRankingAhorcado(): Promise<RankingAhorcado[]> {
    const { data, error } = await this.supabase.client
      .from('partidas_ahorcado')
      .select('*')
      .order('gano', { ascending: false })
      .order('letras_falladas', { ascending: true })
      .order('duracion_segundos', { ascending: true })
      .limit(LIMITE_FILAS);
    if (error) throw error;
    return this.agregarNombres<PartidaAhorcado>(data ?? []);
  }

  async cargarRankingMayorMenor(): Promise<RankingMayorMenor[]> {
    const { data, error } = await this.supabase.client
      .from('partidas_mayor_menor')
      .select('*')
      .order('cartas_acertadas', { ascending: false })
      .limit(LIMITE_FILAS);
    if (error) throw error;
    return this.agregarNombres<PartidaMayorMenor>(data ?? []);
  }

  async cargarRankingMezclarColores(): Promise<RankingMezclarColores[]> {
    const { data, error } = await this.supabase.client
      .from('partidas_mezclar_colores')
      .select('*')
      .order('puntaje', { ascending: false })
      .limit(LIMITE_FILAS);
    if (error) throw error;
    return this.agregarNombres<PartidaMezclarColores>(data ?? []);
  }

  async cargarRankingPreguntados(): Promise<RankingPreguntados[]> {
    const { data, error } = await this.supabase.client
      .from('partidas_preguntados')
      .select('*')
      .order('aciertos', { ascending: false })
      .limit(LIMITE_FILAS);
    if (error) throw error;
    return this.agregarNombres<PartidaPreguntados>(data ?? []);
  }

  private async agregarNombres<T extends { user_id: string }>(
    partidas: T[]
  ): Promise<(T & { nombre: string })[]> {
    if (partidas.length === 0) return [];
    const idsUnicos = [...new Set(partidas.map(p => p.user_id))];
    const { data: usuarios } = await this.supabase.client
      .from('usuarios')
      .select('id, nombre')
      .in('id', idsUnicos);
    const mapa = new Map((usuarios ?? []).map(u => [u.id as string, u.nombre as string]));
    return partidas.map(p => ({ ...p, nombre: mapa.get(p.user_id) ?? 'Anónimo' }));
  }
}
