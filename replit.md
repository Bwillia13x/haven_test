# Aether Weaver - Advanced 3D Modeling Tool

## Overview
Aether Weaver is a sophisticated web-based 3D modeling and visualization tool built with React, Three.js, and modern web technologies. The application provides an intuitive interface for creating, manipulating, and connecting 3D nodes in a virtual space, with advanced features like natural language commands, multi-selection, undo/redo functionality, and real-time collaboration capabilities.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **3D Rendering**: Three.js via @react-three/fiber and @react-three/drei
- **State Management**: Zustand for global state management
- **UI Components**: Radix UI primitives with Tailwind CSS styling
- **Build Tool**: Vite for development and building
- **Styling**: Tailwind CSS with custom design system

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: Built-in session handling with connect-pg-simple
- **API**: RESTful endpoints with Express routing

### Key Components

#### 3D Scene Management
- **Node System**: Interactive 3D spheres that can be created, selected, and manipulated
- **Connector System**: Visual connections between nodes with customizable materials
- **Grid System**: Snap-to-grid functionality for precise positioning
- **Camera Controls**: Orbit controls for scene navigation

#### State Management
- **Central Store**: Zustand store managing nodes, connectors, selections, and UI state
- **History System**: Complete undo/redo functionality with branching support
- **Multi-Selection**: Support for selecting and manipulating multiple nodes simultaneously
- **Material System**: Configurable materials for nodes and connectors

#### User Interface
- **Toolbar**: Primary action buttons for common operations
- **Property Panel**: Real-time property editing for selected objects
- **Command Input**: Natural language command processing
- **Context Menus**: Right-click contextual actions
- **Notification System**: User feedback for operations and errors

#### Natural Language Command System
- **Command Parsing**: Converts text commands into 3D operations
- **Geometric Generation**: Create complex shapes, grids, spirals, and fractals
- **Animation Commands**: Add rotation, pulsing, and other dynamic effects
- **Material Commands**: Apply different visual styles and colors

## Data Flow

1. **User Interaction**: User actions trigger events in React components
2. **State Updates**: Actions update the Zustand store, maintaining immutable state
3. **History Tracking**: Operations are automatically saved to history for undo/redo
4. **3D Rendering**: Three.js components re-render based on state changes
5. **Persistence**: Projects can be saved to localStorage and exported as JSON
6. **Database Operations**: User data and sessions stored in PostgreSQL via Drizzle

## External Dependencies

### Core 3D Libraries
- **Three.js**: 3D graphics rendering engine
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Helpful components and utilities for React Three Fiber
- **@react-three/postprocessing**: Post-processing effects

### UI/UX Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **class-variance-authority**: CSS class variant management

### Database & Backend
- **Drizzle ORM**: Type-safe database operations
- **Neon Database**: Serverless PostgreSQL
- **Express.js**: Web application framework
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and developer experience
- **ESBuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon Database connection via environment variables
- **Asset Handling**: Vite handles static assets including 3D models and audio files

### Production Build
- **Frontend**: Vite builds optimized React application to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database Migrations**: Drizzle handles schema management and migrations
- **Environment Configuration**: Environment variables for database connection and settings

### Key Architectural Decisions

1. **Separation of Concerns**: Clear separation between 3D rendering logic and UI components
2. **Immutable State**: Zustand with immutable updates for predictable state management
3. **Component Composition**: Modular React components for maintainability
4. **Type Safety**: Full TypeScript coverage for better developer experience
5. **Performance Optimization**: Efficient 3D rendering with React Three Fiber
6. **Accessibility**: Radix UI components ensure keyboard navigation and screen reader support
7. **Responsive Design**: Mobile-first approach with Tailwind CSS utilities