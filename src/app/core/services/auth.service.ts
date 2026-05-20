import { Injectable, inject, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';

import { SupabaseService } from './supabase.service';
import { UsuarioProfile } from '../models/usuario.model';

interface DatosRegistro {
  correo: string;
  nombre: string;
  apellido: string;
  edad: number;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);

  private readonly _user = signal<User | null>(null);
  private readonly _profile = signal<UsuarioProfile | null>(null);

  readonly user = this._user.asReadonly();
  readonly profile = this._profile.asReadonly();

  constructor() {
    // Si ya hay una sesión guardada en localStorage, la levantamos al arrancar.
    this.supabase.client.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      this._user.set(u);
      if (u) this.cargarPerfil(u.id);
    });

    // Escucha cambios futuros: login, logout, token refresh.
    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      this._user.set(u);
      if (u) {
        this.cargarPerfil(u.id);
      } else {
        this._profile.set(null);
      }
    });
  }

  async login(email: string, password: string): Promise<void> {
    const { error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }

  async register(datos: DatosRegistro): Promise<void> {
    const { data: authData, error: authError } =
      await this.supabase.client.auth.signUp({
        email: datos.correo,
        password: datos.password,
      });
    if (authError) throw authError;
    if (!authData.user) throw new Error('No se pudo crear el usuario.');

    const { error: perfilError } = await this.supabase.client
      .from('usuarios')
      .insert({
        id: authData.user.id,
        correo: datos.correo,
        nombre: datos.nombre,
        apellido: datos.apellido,
        edad: datos.edad,
      });
    if (perfilError) throw perfilError;
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.client.auth.signOut();
    if (error) throw error;
  }

  private async cargarPerfil(userId: string): Promise<void> {
    const { data } = await this.supabase.client
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) this._profile.set(data as UsuarioProfile);
  }
}
