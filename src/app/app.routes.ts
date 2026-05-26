import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
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
  {
    path: 'ahorcado',
    title: 'Ahorcado',
    loadComponent: () => import('./features/ahorcado/ahorcado').then(m => m.Ahorcado),
  },
  {
    path: 'mayor-menor',
    title: 'Mayor o Menor',
    loadComponent: () => import('./features/mayor-menor/mayor-menor').then(m => m.MayorMenor),
  },
  {
    path: 'chat',
    title: 'Chat global',
    loadComponent: () => import('./features/chat/chat').then(m => m.Chat),
  },

  // Cualquier ruta no reconocida vuelve al home.
  { path: '**', redirectTo: '' },
];
