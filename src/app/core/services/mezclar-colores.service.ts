import { Injectable, inject } from '@angular/core';

import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { PartidaMezclarColores } from '../models/partida-mezclar-colores.model';

@Injectable({ providedIn: 'root' })
export class MezclarColoresService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  async guardarPartida(puntaje: number): Promise<void> {
    const usuario = this.auth.user();
    if (!usuario) throw new Error('Tenés que estar logueado para guardar la partida.');

    const partida: PartidaMezclarColores = {
      user_id: usuario.id,
      puntaje,
    };

    const { error } = await this.supabase.client
      .from('partidas_mezclar_colores')
      .insert(partida);
    if (error) throw error;
  }
}
