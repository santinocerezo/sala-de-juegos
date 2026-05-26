import { Injectable, inject } from '@angular/core';

import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { PartidaAhorcado } from '../models/partida-ahorcado.model';

interface DatosPartida {
  palabra: string;
  gano: boolean;
  letrasAcertadas: number;
  letrasFalladas: number;
  duracionSegundos: number;
}

@Injectable({ providedIn: 'root' })
export class AhorcadoService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  async guardarPartida(datos: DatosPartida): Promise<void> {
    const usuario = this.auth.user();
    if (!usuario) throw new Error('Tenés que estar logueado para guardar la partida.');

    const partida: PartidaAhorcado = {
      user_id: usuario.id,
      palabra: datos.palabra,
      gano: datos.gano,
      letras_acertadas: datos.letrasAcertadas,
      letras_falladas: datos.letrasFalladas,
      duracion_segundos: datos.duracionSegundos,
    };

    const { error } = await this.supabase.client
      .from('partidas_ahorcado')
      .insert(partida);
    if (error) throw error;
  }
}
