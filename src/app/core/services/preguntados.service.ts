import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Pregunta } from '../models/pregunta-trivia.model';
import { PartidaPreguntados } from '../models/partida-preguntados.model';

interface PreguntaApi {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface RespuestaApi {
  response_code: number;
  results: PreguntaApi[];
}

const URL_OPENTDB = 'https://opentdb.com/api.php?amount=10&type=multiple';

@Injectable({ providedIn: 'root' })
export class PreguntadosService {
  private readonly http = inject(HttpClient);
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  async cargarPreguntas(): Promise<Pregunta[]> {
    const respuesta = await firstValueFrom(this.http.get<RespuestaApi>(URL_OPENTDB));
    if (respuesta.response_code !== 0) {
      throw new Error('No se pudieron traer las preguntas. Intentá de nuevo.');
    }
    return respuesta.results.map(p => this.mapearPregunta(p));
  }

  async guardarPartida(aciertos: number, total: number): Promise<void> {
    const usuario = this.auth.user();
    if (!usuario) throw new Error('Tenés que estar logueado para guardar la partida.');

    const partida: PartidaPreguntados = {
      user_id: usuario.id,
      aciertos,
      total,
    };

    const { error } = await this.supabase.client
      .from('partidas_preguntados')
      .insert(partida);
    if (error) throw error;
  }

  private mapearPregunta(p: PreguntaApi): Pregunta {
    const correcta = this.decodeHtml(p.correct_answer);
    const incorrectas = p.incorrect_answers.map(a => this.decodeHtml(a));
    const opciones = this.mezclar([correcta, ...incorrectas]);
    return {
      enunciado: this.decodeHtml(p.question),
      opciones,
      correcta,
    };
  }

  private decodeHtml(texto: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = texto;
    return txt.value;
  }

  private mezclar<T>(arr: T[]): T[] {
    const copia = [...arr];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }
}
