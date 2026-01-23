# Task Manager API

A RESTful **Task Management Backend API** built with **Node.js, Express, and TypeScript**. This project provides a clean, modular foundation for managing tasks, users, and related business logic, and is structured to be easy to understand, test, and extend by collaborators.

----------

## Project Overview

This API is designed as the backend service for a task management application. It exposes well-structured REST endpoints for handling tasks and related operations, following common backend best practices such as:

-   Clear separation of concerns (routes, controllers, middlewares, utils)
    
-   Environment-based configuration
    
-   Scalable folder structure
    
-   Production-ready build output
    

----------

## Architecture

The project follows a **Layered (MVC-inspired) API Architecture**:

-   **Routes Layer** – Defines API endpoints and request flow
    
-   **Controllers Layer** – Handles request logic and responses
    
-   **Middlewares Layer** – Cross-cutting concerns (auth, validation, etc.)
    
-   **Utils Layer** – Shared helper functions
    
-   **Database Layer** – Centralized database connection logic
    

This structure makes the codebase easy to maintain, test, and collaborate on.

----------

## Project Structure

```
CAPSTONE\TASK MANAGER/
│
├── task-manager-api/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middlewares/     # Custom middleware logic
│   │   ├── routes/          # API route definitions
│   │   ├── utils/           # Helper utilities
│   │   ├── app.ts           # Express app configuration
│   │   ├── db.ts            # Database connection logic
│   │   └── server.ts        # Application entry point
│   │
│   ├── dist/                # Compiled JavaScript output
│   ├── postman/             # API testing collections
│   ├── .env                 # Environment variables (ignored)
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── README.md
│   └── TESTS_HTTP.md        # Manual HTTP test cases

```

----------

## Tech Stack

-   **Node.js** (v22.20.0)
    
-   **Express.js**
    
-   **TypeScript**
    
-   **PostgreSQL / SQL database** (via custom DB setup)
    
-   **npm** (package manager)
    

----------

## Requirements

To run this project locally, ensure you have:

-   **Node.js v22.20.0**
    
-   npm (comes with Node.js)
    
-   A configured database instance
    

----------

## Getting Started

### Clone the Repository

```bash
git clone <your-repo-url>
cd task-manager-api

```

----------

### Install Dependencies

```bash
npm install

```

----------

### Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=5000
DATABASE_URL=
JWT_SECRET=

```

> ⚠️ Do **not** commit `.env` files. Use `.env.example` for shared configuration templates.

----------

### Run the Project

#### Development Mode

```bash
npm run dev

```

#### Production Build

```bash
npm run build
npm start

```

----------

## API Testing

-   A **Postman collection** is included in the `postman/` directory
    
-   Manual HTTP test cases are documented in `TESTS_HTTP.md`
    

----------

## Testing (Planned)

-   Jest
    
-   Supertest
    

Testing will cover:

-   Core API endpoints
    
-   Error handling
    
-   Middleware logic
    

----------

## Contributing

Contributions are welcome and encouraged.

1.  Fork the repository
    
2.  Create a new branch (`git checkout -b feature/your-feature`)
    
3.  Commit your changes (`git commit -m "Add new feature"`)
    
4.  Push to your branch (`git push origin feature/your-feature`)
    
5.  Open a Pull Request
    

----------

## Notes for Collaborators

-   Follow existing folder conventions
    
-   Keep controllers thin and logic reusable
    
-   Never commit sensitive credentials
    
-   Update documentation when adding new endpoints
    

----------

## License

This project is licensed under the MIT License.