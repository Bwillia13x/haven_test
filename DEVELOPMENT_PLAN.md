### 1. Implement the Backend API

The goal is to build a functional backend that supports user authentication and project storage, transforming the application into a true client-server model.

**1.1. Define Data Models:**

*   **File:** `shared/schema.ts`
*   **Action:** Define Zod schemas for `User` and `Project` to ensure type safety and validation across the client and server.
    *   `User`: `id`, `username`, `passwordHash`
    *   `Project`: `id`, `userId`, `name`, `data` (JSON blob for the 3D scene)

**1.2. Set Up Database:**

*   **File:** `server/storage.ts`
*   **Action:** Implement a simple storage layer using `drizzle-orm` with a local SQLite database for persistence.
    *   Define database tables based on the Zod schemas.
    *   Create functions for CRUD operations (e.g., `createUser`, `getUserByUsername`, `createProject`, `getProjectsByUserId`, `updateProject`, `deleteProject`).

**1.3. Implement User Authentication:**

*   **Files:** `server/auth.ts` (new), `server/index.ts`
*   **Action:** Add Passport.js with a local strategy for username/password authentication.
    *   Implement routes for user registration, login, and logout.
    *   Use `express-session` with a persistent store (like `connect-pg-simple` if using Postgres, or a file-based store for SQLite) to manage user sessions.
    *   Secure API endpoints to ensure only authenticated users can access their projects.

**1.4. Create API Routes:**

*   **File:** `server/routes.ts`
*   **Action:** Implement the following RESTful API endpoints:
    *   `POST /api/register`: Create a new user.
    *   `POST /api/login`: Log in a user.
    *   `POST /api/logout`: Log out a user.
    *   `GET /api/projects`: Get all projects for the logged-in user.
    *   `POST /api/projects`: Create a new project.
    *   `GET /api/projects/:id`: Get a specific project.
    *   `PUT /api/projects/:id`: Update a project.
    *   `DELETE /api/projects/:id`: Delete a project.

**1.5. Integrate Frontend with Backend:**

*   **Files:** `client/src/lib/api.ts` (new), `client/src/stores/useAetherStore.tsx`
*   **Action:**
    *   Create a new `api.ts` file to encapsulate `fetch` calls to the backend API.
    *   Modify the `useAetherStore` to call the API for project operations (e.g., `saveProject`, `loadProject`).
    *   Add a login/registration UI to the frontend.

### 2. Implement a Comprehensive Testing Strategy

The goal is to ensure the application's stability and prevent regressions by adding a robust testing suite.

**2.1. Set Up Testing Environment:**

*   **File:** `package.json`, `jest.config.js` (new)
*   **Action:**
    *   Configure Jest and React Testing Library for testing React components.
    *   Install necessary dependencies (`jest`, `@testing-library/react`, `@testing-library/jest-dom`, `supertest`).
    *   Update the `test` script in `package.json` to run Jest.

**2.2. Write Unit Tests:**

*   **Target Files:** `client/src/utils/aiCommands.test.ts`, `client/src/stores/useAetherStore.test.ts`
*   **Action:**
    *   **Command Parser:** Write tests for `executeAICommand` to cover all command variations and edge cases.
    *   **Zustand Store:** Test all actions in `useAetherStore` to ensure they update the state correctly. Mock API calls where necessary.

**2.3. Write Integration Tests:**

*   **Target Files:** `server/index.test.ts`
*   **Action:**
    *   Use `supertest` to write integration tests for the Express API.
    *   Test all API endpoints for correct responses, status codes, and error handling.

**2.4. Write Component Tests:**

*   **Target Files:** `client/src/components/UI/Toolbar.test.tsx`, `client/src/components/PropertyPanel.test.tsx`
*   **Action:**
    *   Write tests for key UI components to ensure they render correctly and handle user interactions as expected.
    *   Use React Testing Library to simulate user events and assert on the component's output.

### 3. Clarify "AI" Functionality

The goal is to improve the project's documentation and code to more accurately reflect the nature of the "AI" feature.

**3.1. Rename and Refactor:**

*   **Files:** `client/src/utils/aiCommands.ts`, `client/src/components/UI/CommandInput.tsx`
*   **Action:**
    *   Rename `aiCommands.ts` to `commandParser.ts`.
    *   Update all imports to reflect the new file name.
    *   In `CommandInput.tsx`, change the placeholder text from "Enter AI command..." to something like "Enter command..." or "Type a command...".

**3.2. Update Documentation:**

*   **File:** `README.md`
*   **Action:**
    *   In the "Features" section, change "AI Command System" to "Natural Language Command Parser" or a similar, more accurate term.
    *   Update the description to clarify that the system interprets specific text commands rather than using generative AI.

This plan provides a clear roadmap for transforming "Aether Weaver v2.0" into a more complete, robust, and accurately documented application.