export interface PartidaAhorcado {
  id?: number;
  user_id: string;
  palabra: string;
  gano: boolean;
  letras_acertadas: number;
  letras_falladas: number;
  duracion_segundos: number;
  created_at?: string;
}
