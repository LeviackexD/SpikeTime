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

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

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
    or
    ```bash
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open the application:**
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to Test the App

The application uses mock data, so you can test all its features without needing a backend connection.

### Test Users

You are automatically logged in as the **Admin** user.

- **Admin User**:
  - **Name**: Manu
  - **Role**: `admin`
  - **Permissions**: Can access the "Admin Panel" to create/edit/delete sessions and announcements.

To experience the app as a regular user, you can easily change the `currentUser` in the mock data:

1.  Go to the file `src/lib/mock-data.ts`.
2.  Change the line `export const currentUser: User = mockUsers[0];` to `export const currentUser: User = mockUsers[1];` (or any other index greater than 0).
3.  The application will now behave as if you are logged in as "Maria Garcia" (a regular user), and the "Admin Panel" will no longer be visible.
