# RD Historias - Plataforma Anónima de Experiencias Sentimentales

Una plataforma web moderna y segura para compartir experiencias anónimas relacionadas con relaciones sentimentales, enfocada en República Dominicana. Los usuarios pueden compartir red flags, confesiones, excusas y aprendizajes de forma completamente anónima, sin exponer información personal.

## Características Principales

### Funcionalidades

- **100% Anónimo**: Sin registro de usuarios, nombres, fotos ni datos personales
- **Categorización**: 4 categorías principales
  - 🚩 Red Flags: Señales de alerta en relaciones
  - 💭 Confesiones: Experiencias personales íntimas
  - 🤥 Excusas: Justificaciones y situaciones comunes
  - 💡 Aprendizajes: Lecciones y reflexiones

- **Sistema de Reacciones**: Los usuarios pueden reaccionar a historias con:
  - 🚩 Red Flag
  - 🤡 Payaso/Ridículo
  - 😮 Wow/Sorpresa

- **Filtros y Ordenamiento**:
  - Filtrar por categoría
  - Ordenar por recientes o populares

### Diseño

- **Mobile-First**: Totalmente optimizado para dispositivos móviles
- **Modo Oscuro/Claro**: Switch completo entre temas con persistencia
- **Identidad Visual Latina**: Colores cálidos y profesionales (rojos/rosas)
- **Animaciones Sutiles**: Transiciones suaves y microinteracciones
- **Responsivo**: Funciona perfectamente en todos los tamaños de pantalla

## Tecnologías Utilizadas

- **Frontend**:
  - React 18 con TypeScript
  - Vite (build tool)
  - Tailwind CSS (estilos)
  - Lucide React (iconos)

- **Backend**:
  - Supabase (base de datos PostgreSQL)
  - Row Level Security (RLS) para protección de datos
  - Real-time subscriptions

## Configuración del Proyecto

### Prerrequisitos

- Node.js 18 o superior
- npm o yarn
- Cuenta de Supabase

### Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:

   Editar el archivo `.env` con tus credenciales de Supabase:

   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   ```

   Para obtener estas credenciales:
   - Ve a tu proyecto en [Supabase](https://supabase.com)
   - Settings > API
   - Copia la "Project URL" y "anon/public key"

4. Ejecutar en modo desarrollo:
   ```bash
   npm run dev
   ```

5. Construir para producción:
   ```bash
   npm run build
   ```

## Estructura de la Base de Datos

### Tabla `stories`

Almacena las historias compartidas por los usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | Identificador único |
| category | text | Categoría de la historia |
| content | text | Contenido (10-1000 caracteres) |
| created_at | timestamptz | Fecha de creación |
| reactions_red_flag | integer | Contador de reacciones 🚩 |
| reactions_clown | integer | Contador de reacciones 🤡 |
| reactions_wow | integer | Contador de reacciones 😮 |
| total_reactions | integer | Total de reacciones |

### Tabla `story_votes`

Registra los votos para prevenir duplicados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | Identificador único |
| story_id | uuid | Referencia a la historia |
| voter_fingerprint | text | Hash anónimo del votante |
| reaction_type | text | Tipo de reacción |
| created_at | timestamptz | Fecha del voto |

## Seguridad y Privacidad

### Anonimato

- No se requiere registro de usuarios
- No se almacena ninguna información personal identificable
- Se usa un fingerprint del navegador (hash anónimo) solo para prevenir votos duplicados
- El fingerprint se genera localmente y solo se usa para validación

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas que:
- Permiten lectura pública de historias
- Permiten escritura anónima con validación de contenido
- Actualizan contadores automáticamente mediante triggers
- Previenen manipulación de datos

### Validaciones

- Contenido mínimo: 10 caracteres
- Contenido máximo: 1000 caracteres
- Categorías restringidas a las 4 definidas
- Tipos de reacción validados

## Consideraciones Legales

Esta plataforma está diseñada con enfoque en:

1. **Privacidad**: No se recopilan datos personales
2. **Educación**: Enfocado en patrones de comportamiento, no en exposición individual
3. **Anonimato**: Protección total de la identidad de los usuarios
4. **Moderación**: El contenido se limita a experiencias sin datos identificables

### Términos de Uso Sugeridos

- Prohibido compartir nombres, fotos o datos personales
- Prohibido contenido ofensivo, discriminatorio o ilegal
- Las historias deben enfocarse en patrones de comportamiento
- Se reserva el derecho de eliminar contenido inapropiado

## Arquitectura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── Header.tsx      # Encabezado con navegación y tema
│   ├── StoryForm.tsx   # Formulario para enviar historias
│   ├── StoryCard.tsx   # Tarjeta individual de historia
│   ├── StoryFeed.tsx   # Feed principal con filtros
│   └── Modal.tsx       # Modal reutilizable
├── contexts/           # Contextos de React
│   └── ThemeContext.tsx # Gestión del tema claro/oscuro
├── hooks/              # Custom hooks
│   └── useFingerprint.ts # Generación de fingerprint anónimo
├── lib/                # Utilidades y configuración
│   ├── supabase.ts     # Cliente de Supabase
│   └── database.types.ts # Tipos TypeScript
├── App.tsx             # Componente principal
├── main.tsx            # Punto de entrada
└── index.css           # Estilos globales y variables CSS

```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la build de producción
- `npm run lint` - Ejecuta el linter
- `npm run typecheck` - Verifica los tipos de TypeScript

## Próximas Mejoras

- Sistema de moderación automática
- Reportar contenido inapropiado
- Estadísticas anónimas de la plataforma
- Más categorías basadas en feedback
- Sistema de "historia del día"
- Búsqueda por palabras clave

## Contribuciones

Este es un proyecto enfocado en educación emocional y prevención de relaciones tóxicas. Las contribuciones son bienvenidas siempre que mantengan el enfoque en privacidad, anonimato y educación.

## Licencia

Este proyecto está diseñado para uso educacional y comunitario.

---

**Nota Importante**: Esta plataforma NO debe usarse para exponer, difamar o acosar a individuos específicos. El objetivo es compartir experiencias y aprender de patrones de comportamiento para prevenir situaciones tóxicas en el futuro.
