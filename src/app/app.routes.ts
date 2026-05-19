import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'home',
    title: 'Sala de Juegos · Inicio',
    loadComponent: () => import('./features/home/home').then(m => m.Home),
  },
  {
    path: 'login',
    title: 'Iniciar sesión',
    loadComponent: () => import('./features/login/login').then(m => m.Login),
  },
  {
    path: 'registro',
    title: 'Registro',
    loadComponent: () => import('./features/registro/registro').then(m => m.Registro),
  },
  {
    path: 'quien-soy',
    title: 'Quién Soy',
    loadComponent: () => import('./features/quien-soy/quien-soy').then(m => m.QuienSoy),
  },

  // Cualquier ruta no reconocida vuelve al home.
  { path: '**', redirectTo: 'home' },
];
