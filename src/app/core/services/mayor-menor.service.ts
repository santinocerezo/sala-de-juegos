import { Injectable, inject } from '@angular/core';

import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { PartidaMayorMenor } from '../models/partida-mayor-menor.model';

@Injectable({ providedIn: 'root' })
export class MayorMenorService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  async guardarPartida(cartasAcertadas: number): Promise<void> {
    const usuario = this.auth.user();
    if (!usuario) throw new Error('Tenés que estar logueado para guardar la partida.');

    const partida: PartidaMayorMenor = {
      user_id: usuario.id,
      cartas_acertadas: cartasAcertadas,
    };

    const { error } = await this.supabase.client
      .from('partidas_mayor_menor')
      .insert(partida);
    if (error) throw error;
  }
}
