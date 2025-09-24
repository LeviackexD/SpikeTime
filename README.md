# SpikeTime: Volleyball Session Management App

SpikeTime is a modern, full-stack web application designed to streamline the management of volleyball club activities. It provides a centralized platform for administrators to schedule sessions and post announcements, and for players to book their spots, interact with each other, and stay updated.

![SpikeTime Dashboard](https://i.imgur.com/w2aVvGZ.png)

## Key Features

- **Session Management**: Admins can create, edit, and delete volleyball sessions, specifying details like date, time, location, skill level, and player capacity.
- **Player Bookings**: Players can browse available sessions and book their spot with a single click.
- **Automated Waitlists**: If a session is full, players can join a waitlist and will be automatically notified if a spot opens up.
- **Announcements**: A dedicated section for club news and updates to keep everyone informed.
- **Real-time Chat**:
    - **Session-specific group chats** for players booked into the same session.
    - **Direct messaging** between individual users.
- **User Profiles**: Users can view and edit their profile, including their skill level and favorite position.
- **Admin Dashboard**: A separate view for administrators to manage all sessions and announcements efficiently.
- **AI-Powered Features**:
    - **Optimal Level Suggestion**: AI suggests the best skill level for a session based on the registered players.
    - **Announcement Summarization**: Get a quick AI-generated summary of all recent announcements.
- **Responsive Design**: A beautiful and intuitive interface that works seamlessly on both desktop and mobile devices.
- **Light & Dark Mode**: Switch between themes for your preferred viewing experience.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN UI
- **AI Integration**: Google's Genkit
- **Backend (Mocked)**: Simulates Firebase for Authentication and Firestore for data storage. The app is built to easily connect to a real Firebase backend.
- **State Management**: React Context API

---

## Getting Started (Local Development)

Follow these instructions to get a copy of the project up and running on your local machine using mock data. This is perfect for testing the frontend and UI.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/spiketime.git
    cd spiketime
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open the application:**
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### How to Test the App

The application uses mock data by default, so you can test all its features without needing a backend connection.

#### Test Users

You are automatically logged in as the **Admin** user.

- **Admin User**:
  - **Name**: Manu
  - **Role**: `admin`
  - **Permissions**: Can access the "Admin Panel" to create/edit/delete sessions and announcements.

To experience the app as a regular user, you can easily change the `currentUser` in the mock data:

1.  Go to the file `src/lib/mock-data.ts`.
2.  Change the line `export const currentUser: User = mockUsers[0];` to `export const currentUser: User = mockUsers[1];` (or any other index greater than 0).
3.  The application will now behave as if you are logged in as "Maria Garcia" (a regular user), and the "Admin Panel" will no longer be visible.

---

## Next Steps for Production

To deploy this application to a hosting service like **Vercel** or **Netlify** with a real, persistent database, you need to connect it to a live Firebase project. This is the recommended path as the application is already architected for it.

### 1. Set Up Your Firebase Project

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Create a Web App**: Inside your project, create a new Web App. Firebase will provide you with a `firebaseConfig` object. You will need this.
3.  **Enable Authentication**: In the Firebase Console, go to the "Authentication" section and enable the "Email/Password" sign-in method.
4.  **Enable Firestore**: Go to the "Firestore Database" section and create a database. Start in **production mode**. You will need to configure security rules later.

### 2. Connect Your App to Firebase

To switch from mock data to your live Firebase backend, you will need to modify the context providers. The current setup in `src/context/auth-context.tsx` and `src/context/session-context.tsx` uses mock data. You will need to replace the logic in those files to perform real reads and writes to Firebase Authentication and Firestore.

*The application is architected to make this transition smooth, but it requires implementing the Firebase SDK calls.*

### 3. Set Up Environment Variables

For your deployed app to securely connect to Firebase and other services (like the AI), you need to set up environment variables in your hosting provider's dashboard (e.g., Vercel or Netlify).

1.  **Create a `.env.local` file** in your project's root for local development.
2.  Add the Firebase configuration keys from the `firebaseConfig` object you got in Step 1.
3.  Add the API key for the AI services.

Your `.env.local` file should look like this:

```
# Firebase - From your Firebase project settings
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="1:..."

# Genkit (Google AI)
GEMINI_API_KEY="your_gemini_api_key"
```

4.  **In Vercel/Netlify**: Go to your project's settings, find the "Environment Variables" section, and add each of the keys and values above. Make sure to use the `NEXT_PUBLIC_` prefix for the Firebase keys so they are accessible on the client side.

### 4. Deploy

Once your environment variables are set and your app is connected to the real Firebase services, you can deploy it.

1.  Push your code to a GitHub, GitLab, or Bitbucket repository.
2.  Import the repository into Vercel or Netlify.
3.  The hosting provider will automatically detect that it's a Next.js app and deploy it for you.

Your application will now be live with a real-time database and authentication!

---

## Free Alternatives for Production

If you want to explore other free options besides the recommended Firebase stack, here are some excellent alternatives. Note that using these will require more significant code changes to adapt the application.

### Hosting / Deployment Platforms

-   **Vercel / Netlify**: These are the top recommendations. They are specifically optimized for Next.js, offer very generous free tiers, and are incredibly easy to use.
-   **Firebase App Hosting**: A natural choice if you're using other Firebase services. It integrates seamlessly with the entire Firebase ecosystem.
-   **Render**: A flexible platform with a free tier that supports Node.js services. A good alternative if you want more control over your environment.

### Database & Authentication Services

-   **Supabase**:
    -   **Description**: The most popular open-source alternative to Firebase. It provides a PostgreSQL database, real-time subscriptions, authentication, and storage.
    -   **Free Tier**: Offers a generous free plan that is more than enough for most personal projects.
    -   **Impact**: Requires refactoring `src/context/auth-context.tsx` and `src/context/session-context.tsx` to use the Supabase client library instead of Firebase's.

-   **Appwrite**:
    -   **Description**: Another powerful open-source backend server that provides authentication, databases, storage, and serverless functions.
    -   **Free Tier**: Offers a free tier on its cloud platform and is fully open-source if you choose to self-host.
    -   **Impact**: Similar to Supabase, you would need to replace the Firebase SDK logic with the Appwrite SDK in the context files.

-   **PocketBase**:
    -   **Description**: An extremely lightweight, all-in-one backend in a single file. It offers a database, authentication, and real-time API.
    -   **Free Tier**: It's completely free. You only pay for the server where you host it (which can also be free on platforms like Render).
    -   **Impact**: Best for smaller projects or rapid prototyping. It would require adapting the app's data-fetching logic to its simple REST-like API.
