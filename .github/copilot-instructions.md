# Copilot instructions for CourtManager

## Project overview

This repository contains a full-stack court-booking application:

- `backend/` is a Spring Boot 4 / Java 21 REST API with JPA, JWT auth, Flyway, and PostgreSQL integration.
- `frontend/` is a React + Vite app for public booking, checkout, and customer/owner dashboard views.
- Local database support is defined in `backend/docker-compose.yml` and the backend app is configured to connect to PostgreSQL on port 5432.

## Build, test, and lint commands

### Backend (Gradle)

From the repository root:

- `cd backend && ./gradlew build`
- `cd backend && ./gradlew test`
- Run a single backend test: `cd backend && ./gradlew test --tests "com.courtmanager.backend.controller.BookingControllerTest"`
- Run a single service test: `cd backend && ./gradlew test --tests "com.courtmanager.backend.service.CourtServiceTest"`
- Run the app locally: `cd backend && ./gradlew bootRun`
- Start the local PostgreSQL container: `cd backend && docker compose up -d`

The backend uses Java 21 via the Gradle toolchain configured in `backend/build.gradle`.

### Frontend (Vite)

From the repository root:

- `cd frontend && npm install`
- `cd frontend && npm run dev`
- `cd frontend && npm run build`
- `cd frontend && npm run lint`

There is no dedicated frontend test runner configured in `frontend/package.json`; use `npm run build` and `npm run lint` as the normal validation flow.

## High-level architecture

### Backend architecture

The backend follows the standard Spring MVC + service + repository layering:

- `src/main/java/com/courtmanager/backend/controller/` contains REST endpoints for auth, facilities, courts, and bookings.
- `src/main/java/com/courtmanager/backend/service/` contains business logic and cross-cutting validation.
- `src/main/java/com/courtmanager/backend/repository/` contains Spring Data repositories for persistence.
- `src/main/java/com/courtmanager/backend/domain/` defines the JPA entities (`User`, `Facility`, `Court`, `Booking`, etc.).
- `src/main/java/com/courtmanager/backend/dto/` contains request/response contracts used by the API.

This app is organized around the booking domain rather than a generic CRUD style. The main workflows are:

- authentication and JWT issuance (`AuthController`, `AuthService`, `JwtService`)
- facility and court browsing (`FacilityController`, `CourtController`)
- booking creation and checkout (`BookingController`, `BookingService`)
- owner/customer authorization and access checks (`SecurityConfig`, role-based controller guards)

`SecurityConfig` is the central source for public routes, JWT filter registration, and the stateless security policy. `DataInitializer` seeds an owner plus a sample facility and court at startup when the database is empty.

### Frontend architecture

The frontend is a small React app rooted at `frontend/src`:

- `App.jsx` holds the root routing and login flow.
- `PublicBookingView.jsx` is the public booking page for a facility.
- `CheckoutView.jsx` and `SuccessView.jsx` handle the booking checkout flow.
- `CustomerDashboard.jsx` and `OwnerDashboard.jsx` render role-specific dashboard experiences.

The app uses `react-router-dom` with `BrowserRouter` and stores the JWT in `localStorage` after login. Most user-facing data is fetched through direct Axios calls to the backend at `http://localhost:8080`.

## Key conventions and repository-specific patterns

- Keep API contracts explicit: request/response payloads live in DTOs, and controller endpoints accept `@Valid` payloads when validation is required.
- Business rules belong in `service` classes; controller methods should be thin and delegate to the service layer.
- Security is role-aware and JWT-based. Public controller paths are intentionally whitelisted in `SecurityConfig`; most other endpoints require auth.
- The codebase models domain concepts with strongly named classes: `User`, `Court`, `Facility`, `Booking`, `Role`, and `BookingStatus`.
- Backend tests live under `backend/src/test/java` and use Spring test support (`spring-boot-starter-webmvc-test`, `spring-boot-starter-data-jpa-test`, etc.).
- Frontend styling is plain CSS files adjacent to components (`*.css` next to JSX files); there is no established design-system or component-library pattern in this repo.
- The frontend does not currently include a dedicated test framework or test script. Prefer build/lint validation when changing UI logic.
- If a backend change affects the API contract, check the matching frontend call sites and adjust the relevant route/component logic in the same change.
- Local development assumes a PostgreSQL database instance is running; the repo includes a docker-compose setup for this purpose.

## Practical editing guidance

- Prefer making changes in the same layer as the existing code: repository logic in repositories, validation in services, and API wiring in controllers.
- When changing security behavior, verify the corresponding route patterns in `backend/src/main/java/com/courtmanager/backend/security/SecurityConfig.java`.
- When changing booking behavior, inspect the service layer and the matching controller tests together; the booking flow is the main business workflow in this repo.
- Keep naming aligned with the current domain vocabulary instead of introducing unrelated abstractions.
