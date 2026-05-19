# Sala de Juegos

Trabajo Práctico Nº1 de la materia **Programación IV** — Tecnicatura Universitaria en Programación, UTN Facultad Regional Avellaneda.

**Autor:** Santino Cerezo

## Sobre el proyecto

Aplicación web de "sala de juegos" donde los usuarios podrán jugar a minijuegos, ver sus resultados y chatear entre ellos. El TP se entrega por sprints — esta es la entrega del **Sprint #1**.

## Stack

- Angular 21 (standalone components)
- TypeScript
- Bootstrap 5 + Bootstrap Icons
- SCSS
- Vercel (deploy)

## Estructura

```
src/app/
├── core/           # Servicios y modelos globales
│   ├── services/
│   └── models/
├── shared/         # Componentes reutilizables
│   └── components/
│       └── modal/
├── layout/         # Navbar y footer
│   ├── navbar/
│   └── footer/
└── features/       # Pantallas
    ├── home/
    ├── login/
    ├── registro/
    └── quien-soy/
```

## Cómo correrlo localmente

Requisitos: Node 22+ y npm 11+.

```bash
git clone https://github.com/santinocerezo/sala-de-juegos.git
cd sala-de-juegos
npm install
npm start
```

Abrir `http://localhost:4200`.

## Scripts disponibles

| Comando | Qué hace |
|---|---|
| `npm start` | Levanta el dev server con hot-reload |
| `npm run build` | Build de producción en `dist/` |
| `npm test` | Corre los tests con Vitest |

## Sprint #1 — entregado

- [x] Componentes Home, Login, Registro y Quién Soy
- [x] Navegación entre rutas con lazy loading
- [x] Quién Soy consume la API pública de GitHub
- [x] Formularios con Reactive Forms y validaciones
- [x] Modal propio (en reemplazo de `alert()`)
- [x] Favicon SVG propio
- [x] Diseño responsive
- [x] Deploy en Vercel

## Próximos sprints

- **Sprint #2:** autenticación real con Supabase, Home dinámico según sesión.
- **Sprint #3:** juegos del Ahorcado y Mayor/Menor, sala de chat en tiempo real.
- **Sprint #4:** Preguntados, juego propio y listado de resultados.
- **Sprint #5 (recuperatorio):** encuesta con validaciones, panel admin con guards.
