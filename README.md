
# SpikeTime: Volleyball Session Management 🏐

[🇬🇧 English](#-english-version) | [🇪🇸 Español](#-versión-en-español)

<br>
<details open>
<summary>🇬🇧 English Version</summary>

---

SpikeTime is a modern, full-stack web application designed to simplify the management of a volleyball club's activities. It offers a centralized platform for administrators to schedule sessions and post announcements, and for players to book their spots, interact with each other, and stay updated.



---

## ✨ Key Features

-   **🗓️ Session Management**: Admins can create, edit, and delete volleyball sessions, specifying details like date, time, location, level, and player capacity.
-   **🎟️ Player Bookings**: Players can browse available sessions and book their spot with a single click.
-   **⏳ Automated Waitlists**: If a session is full, players can join a waitlist and will be notified if a spot becomes available.
-   **📢 Club Announcements**: A dedicated section for club news and updates to keep everyone informed.
-   **💬 Real-Time Chat**:
    -   Group chat rooms for players registered in the same session (Coming Soon!).
    -   Direct messaging between users (Coming Soon!).
-   **👤 User Profiles**: Users can view and edit their profile, including their skill level, favorite position, and avatar photo.
-   **🛡️ Admin Panel**: A separate, protected view for administrators to efficiently manage all sessions and announcements.
-   **🤖 AI-Powered Features (Genkit)**:
    -   **Optimal Level Suggestion**: AI suggests the best level for a session based on registered players.
    -   **Announcement Summaries**: Get a quick, AI-generated summary of all recent announcements.
-   **📱 Responsive Design & PWA**: An intuitive interface that works perfectly on desktop and mobile, and is **installable on any device** like a native app.
-   **🌗 Light & Dark Mode**: Switch between themes for your preferred viewing experience.

---

## 🛠️ Tech Stack

-   **Framework**: Next.js (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **UI Components**: ShadCN UI
-   **AI Integration**: Google's Genkit
-   **Backend**: **Supabase** (Authentication, PostgreSQL Database, Storage)
-   **State Management**: React Context API
-   **PWA**: `next-pwa` for offline capabilities and installation.

---

## 🚀 Getting Started (Local Development)

Follow these instructions to get a copy of the project running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or higher)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repository.git
    cd your-repository
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    Create a file named `.env.local` in the root of your project and add your Supabase and Google AI keys.
    ```
    # Supabase (Get them from your project's dashboard on Supabase)
    NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxx.supabase.co"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="ey...xxx"
    SUPABASE_SERVICE_ROLE_KEY="ey...xxx" # Optional, for admin functions
    
    # Genkit (Google AI)
    GEMINI_API_KEY="AIza..."
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open the app!**
    Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### 🧪 How to Test the App

The application connects to your Supabase instance, so you can create real users.

-   **Admin User**: To test admin features, you will need to manually change a user's role in your `profiles` table in Supabase. Change the value of the `role` column to `admin` for the desired user.

---

## 🚢 Deployment to Production

The easiest way to deploy this application is using **Vercel** or **Netlify**.

### 1. Prepare Your Repository

Make sure your code is uploaded to a GitHub, GitLab, or Bitbucket repository.

### 2. Configure Your Project on Vercel/Netlify

1.  Import your repository into the hosting platform. They will automatically detect that it's a Next.js project.
2.  **Configure Environment Variables**: Go to your project's settings on Vercel/Netlify and add the same environment variables you have in your `.env.local` file.
    -   `NEXT_PUBLIC_SUPABASE_URL`
    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    -   `SUPABASE_SERVICE_ROLE_KEY`
    -   `GEMINI_API_KEY`
3.  **Deploy!** The platform will handle compiling your application for production and putting it online.

Your application will now be available to everyone, with a real-time database, authentication, and all the features we've built. 🎉

</details>

<br>
<details>
<summary>🇪🇸 Versión en Español</summary>

---

SpikeTime es una moderna aplicación web _full-stack_ diseñada para simplificar la gestión de las actividades de un club de voleibol. Ofrece una plataforma centralizada para que los administradores programen sesiones y publiquen anuncios, y para que los jugadores reserven sus plazas, interactúen entre ellos y se mantengan actualizados.



---

## ✨ Características Principales

-   **🗓️ Gestión de Sesiones**: Los administradores pueden crear, editar y eliminar sesiones de voleibol, especificando detalles como fecha, hora, ubicación, nivel y capacidad de jugadores.
-   **🎟️ Reservas de Jugadores**: Los jugadores pueden explorar las sesiones disponibles y reservar su plaza con un solo clic.
-   **⏳ Listas de Espera Automatizadas**: Si una sesión está llena, los jugadores pueden unirse a una lista de espera y serán notificados si se libera una plaza.
-   **📢 Anuncios del Club**: Una sección dedicada a las noticias y actualizaciones del club para mantener a todos informados.
-   **💬 Chat en Tiempo Real**:
    -   Salas de chat grupales para los jugadores inscritos en una misma sesión (¡Próximamente!).
    -   Mensajería directa entre usuarios (¡Próximamente!).
-   **👤 Perfiles de Usuario**: Los usuarios pueden ver y editar su perfil, incluyendo su nivel de habilidad, posición favorita y foto de avatar.
-   **🛡️ Panel de Administrador**: Una vista separada y protegida para que los administradores gestionen todas las sesiones y anuncios de manera eficiente.
-   **🤖 Funciones con IA (Genkit)**:
    -   **Sugerencia de Nivel Óptimo**: La IA sugiere el mejor nivel para una sesión basándose en los jugadores registrados.
    -   **Resumen de Anuncios**: Obtén un resumen rápido generado por IA de todos los anuncios recientes.
-   **📱 Diseño Adaptable y PWA**: Una interfaz intuitiva que funciona perfectamente en escritorio y móvil, y que además es **instalable en cualquier dispositivo** como una aplicación nativa.
-   **🌗 Modo Claro y Oscuro**: Cambia entre temas para tu experiencia de visualización preferida.

---

## 🛠️ Tech Stack

-   **Framework**: Next.js (App Router)
-   **Lenguaje**: TypeScript
-   **Estilos**: Tailwind CSS
-   **Componentes UI**: ShadCN UI
-   **Integración IA**: Google's Genkit
-   **Backend**: **Supabase** (Autenticación, Base de Datos PostgreSQL, Storage)
-   **Gestión de Estado**: React Context API
-   **PWA**: `next-pwa` para capacidades offline e instalación.

---

## 🚀 Puesta en Marcha (Desarrollo Local)

Sigue estas instrucciones para tener una copia del proyecto funcionando en tu máquina local.

### Prerrequisitos

-   [Node.js](https://nodejs.org/) (v18 o superior)
-   [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)

### Instalación y Configuración

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/tu-repositorio.git
    cd tu-repositorio
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Configura tus variables de entorno:**
    Crea un archivo llamado `.env.local` en la raíz de tu proyecto y añade tus claves de Supabase y Google AI.
    ```
    # Supabase (Obtenlas desde el panel de tu proyecto en Supabase)
    NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxx.supabase.co"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="ey...xxx"
    SUPABASE_SERVICE_ROLE_KEY="ey...xxx" # Opcional, para funciones de admin
    
    # Genkit (Google AI)
    GEMINI_API_KEY="AIza..."
    ```

4.  **Ejecuta el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

5.  **¡Abre la aplicación!**
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

### 🧪 Cómo Probar la Aplicación

La aplicación se conecta a tu instancia de Supabase, por lo que puedes crear usuarios reales.

-   **Usuario Administrador**: Para probar las funciones de administrador, necesitarás cambiar manualmente el rol de un usuario en tu tabla `profiles` de Supabase. Cambia el valor de la columna `role` a `admin` para el usuario que desees.

---

## 🚢 Despliegue a Producción

La forma más sencilla de desplegar esta aplicación es usando **Vercel** o **Netlify**.

### 1. Prepara tu Repositorio

Asegúrate de que tu código esté subido a un repositorio de GitHub, GitLab o Bitbucket.

### 2. Configura tu Proyecto en Vercel/Netlify

1.  Importa tu repositorio en la plataforma de hosting. Detectarán automáticamente que es un proyecto de Next.js.
2.  **Configura las Variables de Entorno**: Ve a los ajustes de tu proyecto en Vercel/Netlify y añade las mismas variables de entorno que tienes en tu archivo `.env.local`.
    -   `NEXT_PUBLIC_SUPABASE_URL`
    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    -   `SUPABASE_SERVICE_ROLE_KEY`
    -   `GEMINI_API_KEY`
3.  **¡Despliega!** La plataforma se encargará de compilar tu aplicación para producción y ponerla en línea.

Tu aplicación ahora estará disponible para todo el mundo, con una base de datos en tiempo real, autenticación y todas las funcionalidades que hemos construido. 🎉

</details>
