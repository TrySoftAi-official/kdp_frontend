# ForgeKDP Frontend

A complete React-based frontend for ForgeKDP, an automated book publishing platform.

## Features

- **Dashboard**: Overview of metrics, recent events, and quick actions
- **Books Management**: CSV upload, filtering, and book catalog management
- **Analytics**: Revenue charts, ROAS tracking, and performance metrics
- **Role-based Access Control**: Admin, Assistant, Marketer, and Guest roles
- **Responsive Design**: Mobile-first approach with modern UI components

## Technology Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Lucide React** for icons
- **Recharts** for data visualization
- **React Router v6** for navigation
- **Zustand** for state management

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Demo Accounts

The application includes demo accounts for testing different user roles:

- **Admin**: admin@forgekdp.com (Full access)
- **Assistant**: assistant@forgekdp.com (Books and content management)
- **Marketer**: marketer@forgekdp.com (Analytics and campaigns)
- **Guest**: guest@forgekdp.com (Read-only access)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   ├── dashboard/      # Dashboard-specific components
│   ├── analytics/      # Analytics components
│   ├── books/          # Books management components
│   └── shared/         # Shared components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and API
├── stores/             # Zustand stores
├── types/              # TypeScript type definitions
└── styles/             # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Design System

- **Primary Color**: Blue (#2563eb)
- **Secondary Color**: Purple (#9333ea)
- **Accent Color**: Orange (#f59e0b)
- **Font**: Inter from Google Fonts
- **Border Radius**: 8px

## License

This project is licensed under the MIT License.
