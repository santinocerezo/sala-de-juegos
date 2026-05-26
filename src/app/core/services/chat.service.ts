import { Injectable, inject } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';

import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { MensajeChat } from '../models/mensaje-chat.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  async cargarUltimosMensajes(limite = 50): Promise<MensajeChat[]> {
    const { data, error } = await this.supabase.client
      .from('mensajes_chat')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limite);
    if (error) throw error;
    return (data ?? []).reverse();
  }

  suscribirANuevos(onNuevo: (mensaje: MensajeChat) => void): RealtimeChannel {
    const canal = this.supabase.client
      .channel('chat-global')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensajes_chat' },
        payload => onNuevo(payload.new as MensajeChat)
      )
      .subscribe();
    return canal;
  }

  async enviar(contenido: string): Promise<void> {
    const usuario = this.auth.user();
    const perfil = this.auth.profile();
    if (!usuario || !perfil) throw new Error('Tenés que estar logueado para chatear.');

    const texto = contenido.trim();
    if (!texto) return;

    const nuevo: Omit<MensajeChat, 'id' | 'created_at'> = {
      user_id: usuario.id,
      nombre_autor: perfil.nombre,
      contenido: texto,
    };

    const { error } = await this.supabase.client
      .from('mensajes_chat')
      .insert(nuevo);
    if (error) throw error;
  }
}
