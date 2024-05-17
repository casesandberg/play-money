# Play Money Database Package

The **Play Money** database package manages the platform's database interactions using Prisma. This setup facilitates easy development and maintenance of the database schema and migrations.

## Features

- **Prisma ORM**: Utilizes Prisma to abstract database operations.
- **PostgreSQL**: Supports PostgreSQL for local and production environments.

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- PostgreSQL (for local development)

### Setting Up PostgreSQL

1. **Install PostgreSQL**:

   - Follow the [Installation instructions](https://www.prisma.io/dataguide/postgresql/setting-up-a-local-postgresql-database).
   - Set a password during installation and accept default settings for other options.

2. **Create a Local Database**:
   - Open a terminal and run:
     ```bash
     psql -U postgres
     ```
   - Enter the password you set during installation.
   - Create a new database for local development:
     ```sql
     CREATE DATABASE playmoney;
     ```

### Configure Prisma

1. **Environment Configuration**:

   - Ensure your `.env` file includes the correct database connection string, typically:
     ```
     DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/playmoney"
     ```

2. **Run Migrations**:

   - To set you your database with the existing schema and migrations, run:
     ```bash
     npx prisma migrate dev
     ```

3. **Seed the DB**:

   - If you would like to seed your database with sample data, run:
     ```bash
     npx prisma db seed
     ```

4. **Developing with Prisma**:

   - Make schema changes in the `schema.prisma` file.
   - Use Prisma Studio to visually manage your data:
     ```bash
     npx prisma studio
     ```
   - Access Prisma Studio at [localhost:5555](http://localhost:5555).

   - To create a new migration after modifying your Prisma schema, run:
     ```bash
      npx prisma migrate dev --name migration_name
     ```
