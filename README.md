# Safety Service Dashboard - Philippine Red Cross

The Safety Service Dashboard is a full-stack web application built to manage and streamline the training programs offered by the Philippine Red Cross Safety Services. It provides a centralized platform for administrators and instructors to manage classes, register participants, track progress, and issue certificates.

## Features

* **Role-Based Access Control:** Separate dashboards and functionalities for **Admin** and **Instructor** roles.
* **Instructor Management:** Admins can review and approve instructor registration requests.
* **Class Management:** Instructors can create, view, and manage their training classes.
* **Participant Enrollment:** Instructors can register and manage participants for each class.
* **Grading System:** A built-in table for instructors to input and update participant grades.
* **Automated PDF Generation:**
    * Generate and download official training **Certificates** for participants who have completed a course.
    * Create detailed class **Reports** summarizing participant grades and attendance.
* **API Documentation:** Interactive API documentation powered by Swagger UI.

## Technologies Used

The project is a monorepo containing both the client-side and server-side code.

**Client-Side (Frontend):**
* **Framework:** [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Routing:** [React Router](https://reactrouter.com/)
* **HTTP Client:** [Axios](https://axios-http.com/)
* **Styling:** SCSS and CSS Modules

**Server-Side (Backend):**
* **Framework:** [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)
* **Database:** [MySQL](https://www.mysql.com/)
* **Authentication:** [JSON Web Tokens (JWT)](https://jwt.io/)
* **PDF Generation:** [Puppeteer](https://pptr.dev/)
* **API Documentation:** [Swagger UI Express](https://www.npmjs.com/package/swagger-ui-express)

## Setup and Installation

To run this project locally, you'll need to set up the database, the server, and the client.

**Prerequisites:**
* Node.js and npm (or yarn) installed
* A running MySQL server

**1. Database Setup**
1.  Create a new database in your MySQL server.
2.  (Note: You will need to manually create the tables based on the application's needs, as there is no `.sql` schema file in the repository).

**2. Server Setup**
1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `server` directory and configure your database connection details and a secret key for JWT.
4.  Start the development server:
    ```bash
    npm run dev
    ```
    The server will be running on port 3000 by default, and you can access the API documentation at `http://localhost:3000/api-docs`.

**3. Client Setup**
1.  From the root directory, install the client dependencies:
    ```bash
    npm install
    ```
2.  Start the client application:
    ```bash
    npm run dev
    ```
    The application will be accessible in your browser, typically at `http://localhost:5173`.

## How to Use

* **Admin:** Log in with an admin account to access the admin dashboard. From here, you can approve pending instructor registrations and oversee all classes in the system.
* **Instructor:** Sign up for an account and wait for admin approval. Once approved, you can log in to create new classes, add participants, manage their grades, and generate official reports and certificates.