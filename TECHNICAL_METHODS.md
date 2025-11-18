# Technical Methods, Tools and Techniques

The project leverages a modern and cohesive toolchain to ensure efficient development, collaboration, and quality.

## Design and Prototyping

**Figma** serves as the foundational design tool for the project's UI/UX process. It is used to create wireframes, interactive prototypes, and the final high-fidelity designs for both the mobile application and the web dashboard. Its collaborative features allow for real-time feedback from the team and stakeholders, ensuring the visual and interactive design is finalised and approved before any code is written.

## Frontend Development

**React** forms the core of the web dashboard's front-end development. Built with **Vite** as the build tool and development server, React is used to build the dynamic and responsive web dashboard for café owners. The use of **TypeScript** throughout the frontend ensures type safety and improved developer experience, reducing runtime errors and enhancing code maintainability.

**React Native with Expo** is utilised for cross-platform mobile application development. This framework enables the development of native mobile applications for both iOS and Android from a single JavaScript/TypeScript codebase. Expo provides a streamlined development workflow with built-in tools for location services, image handling, and native device features, significantly accelerating the mobile development process.

**TailwindCSS** is employed for utility-first styling across the web dashboard, enabling rapid UI development with consistent design tokens. **Radix UI** provides accessible, unstyled component primitives that form the foundation of the dashboard's interactive elements, ensuring WCAG compliance and excellent user experience.

## Backend Development

**NestJS** serves as the backend framework, providing a scalable and maintainable architecture for the API layer. Built on Node.js and TypeScript, NestJS leverages decorators and dependency injection to create a modular, testable codebase. The framework's built-in support for RESTful APIs, middleware, and request validation ensures robust and secure backend services.

**Prisma** is used as the Object-Relational Mapping (ORM) tool, providing type-safe database access and migration management. Prisma's schema-first approach allows for declarative database modeling, automatic migration generation, and compile-time type checking, ensuring database integrity and reducing the likelihood of runtime errors.

## Database

**PostgreSQL** is the selected relational database management system. It is used to reliably store and manage all structured data for the platform, including user profiles, café listings, menus, menu items, orders, and reviews. PostgreSQL's robustness, ACID compliance, and ability to handle complex relationships between data entities make it a suitable choice for ensuring data integrity and supporting the platform's scalability requirements.

## Authentication and Security

**bcrypt** is implemented for secure password hashing, ensuring that user credentials are stored safely in the database. The library's adaptive hashing algorithm provides protection against brute-force attacks while maintaining acceptable performance for authentication operations.

## API Documentation

**Swagger/OpenAPI** is integrated via NestJS Swagger module to provide comprehensive, interactive API documentation. This enables frontend developers and other stakeholders to understand, test, and integrate with the backend API endpoints without requiring direct access to the source code.

## Development Tools and Workflow

**GitHub** serves as the version control system and collaboration platform. It enables distributed development, code review processes, issue tracking, and continuous integration workflows. The repository structure supports multiple applications (backend, frontend, mobile) within a monorepo approach, facilitating code sharing and consistent versioning.

**Vite** provides an extremely fast development server and build tool for the React frontend, offering instant Hot Module Replacement (HMR) and optimized production builds. This significantly improves developer productivity and reduces build times compared to traditional bundlers.

**TypeScript** is used consistently across all application layers (backend, frontend, and mobile), providing static type checking, enhanced IDE support, and improved code documentation through type annotations. This unified approach reduces bugs and improves long-term maintainability.

## Project Management and Collaboration

**Canvas** (or your chosen learning management system) is utilised for the project's managerial and collaborative processes. It provides a centralised platform for documentation, communication, and submission of project deliverables, ensuring all team members have access to the latest information and resources.

## Testing and Quality Assurance

A structured testing strategy will be implemented using **Jest** for unit and integration testing, ensuring code reliability and preventing regressions. End-to-end testing tools will be integrated to validate user workflows across the entire application stack.

## Future Considerations

Additional tools and techniques to be integrated include:
- **Docker** for containerization and consistent development environments
- **CI/CD pipelines** for automated testing and deployment
- **Monitoring and logging tools** for production observability
- **Performance profiling tools** for optimization

This integrated toolset, combined with version control via GitHub, a structured testing strategy, and modern development practices, provides a solid technical foundation for building the Caff.io MVP and scaling to production.


