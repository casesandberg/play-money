# Play Money [Temp]

**Play Money** is a prediction market platform. This codebase is structured as a monorepo using Turborepo, containing multiple standalone apps and shared feature packages.

## Project Structure

- **apps**: Standalone apps, such as `web`, `backend`, etc.
- **packages**: Shared libraries split by feature, colocating backend and frontend logic together.

## Getting Started

### Prerequisites

- Node.js >= 18
- npm

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/casesandberg/play-money.git
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up postgres database**:

   - Follow the [Installation instructions](https://www.prisma.io/dataguide/postgresql/setting-up-a-local-postgresql-database).
   - Set a password during installation and accept default settings for other options.
   - Open a terminal and run:
     ```bash
     psql -U postgres
     ```
   - Enter the password you set during installation.
   - Create a new database for local development:
     ```sql
     CREATE DATABASE playmoney;
     ```

4. **Set up environment variables**:

   - Create a `.env` file based on the `.env.example` file provided.
   - (Reach out to @casesandberg to get the shared dev env if you wish)

5. **Start development servers**:
   ```bash
   npm run dev
   ```
   - This will start all necessary servers:
     - **Web app**: [localhost:3000](http://localhost:3000)
     - **Backend server**: [localhost:3001](http://localhost:3001)
     - **Database viewer**: [localhost:5555](http://localhost:5555)

## Code Formatting and Linting

- **Eslint** and **Prettier** are used to enforce consistent code style.
- Before merging a pull request, please format your code:
  ```bash
  npm run format
  ```
- Alternatively, use a code editor that formats on file save.

## Contribution Guidelines

- Make sure your code adheres to the style guidelines.
- Feel free to reach out to maintainers for questions or clarifications.
