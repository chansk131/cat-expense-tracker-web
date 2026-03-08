# Cat Expense Tracker

A full-stack web application for tracking cat-related expenses with an integrated cat facts feature. Built with React Router 7, TypeScript, and SQLite.

## Features

### Expense Management

- **Create, view, and delete expenses** with item names, categories, and amounts
- **Category-based tracking** with three predefined categories: Food, Furniture, and Accessory
- **Smart category highlighting** automatically identifies and highlights the category with the highest total spending
- **Bulk deletion** with multi-select checkboxes for efficient management
- **Cat facts** displays random cat facts during expense creation to make tracking more enjoyable

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

The database will be automatically initialized on first run.

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Database

### Configuration

The application uses SQLite with the following default configuration:

- **Database location**: `./data/expenses.db`
- **Custom location**: Set the `DATABASE_PATH` environment variable

### Schema

The `expenses` table contains:

```typescript
{
  id: integer (primary key, auto-increment)
  item: text (not null)
  category: text (nullable) // "Food", "Furniture", or "Accessory"
  amount: real (not null)
  createdAt: integer (timestamp, not null)
}
```

### Migration Commands

Generate new migrations:

```bash
npm run db:generate
```

Apply migrations:

```bash
npm run db:migrate
```

### Database Tools

You can inspect and manage the database using [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview) or any SQLite client.

## Testing

### Unit Tests

Run unit tests in watch mode:

```bash
npm test
```

Run unit tests once:

```bash
npm run test:run
```

**Framework**: Vitest with Testing Library

**Coverage includes**:

- Component behavior and interactions
- Business logic utilities (e.g., top category calculation)
- Form validation and data mutations

### End-to-End Tests

Run e2e tests:

```bash
npm run e2e
```

Run e2e tests with UI:

```bash
npm run e2e:ui
```

Run e2e tests in debug mode:

```bash
npm run e2e:debug
```

**Framework**: Playwright

**Test environment**:

- Runs on Chromium, Firefox, and WebKit
- Uses isolated test database (`expenses.test.db`)
- Includes full CRUD scenarios and feature validation

### Code Quality

Run linter:

```bash
npm run lint
```

Fix linting issues:

```bash
npm run lint:fix
```

Format code:

```bash
npm run format
```

Check formatting:

```bash
npm run format:check
```

**Pre-commit hooks**: Husky and lint-staged automatically run linting and formatting on staged files before commits.

## Building for Production

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Deployment

### Docker Deployment

Build and run using Docker:

```bash
docker build -t cat-expense-tracker .

# Run the container
docker run -p 3000:3000 cat-expense-tracker
```

**Important**: To persist data, mount a volume for the database:

```bash
docker run -p 3000:3000 -v $(pwd)/data:/app/data cat-expense-tracker
```

The containerized application can be deployed to any platform that supports Docker:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

The built-in app server is production-ready for Node.js deployments.

Deploy the output of `npm run build`:

```
├── package.json
├── package-lock.json
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
└── data/          # Database directory (ensure this persists)
```

**Requirements**:

- Node.js 20 or higher
- Persistent storage for the database directory

## Styling

This project uses [Tailwind CSS v4](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components pre-installed and configured. All components support dark mode out of the box.

---

Built with ❤️ using React Router.
