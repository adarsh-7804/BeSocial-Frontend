# Social Media Frontend

A modern React-based frontend for a social media platform built with Vite, Tailwind CSS, and Redux for state management.

## 🚀 Features

- **User Authentication** - Login and registration with JWT tokens
- **Feed Management** - Browse and interact with posts from users
- **Post Creation** - Create, edit, and delete posts with image/video support
- **Stories** - View and create time-limited stories with highlights
- **Real-time Messaging** - Send and receive messages with Socket.io
- **Notifications** - Real-time notifications for likes, comments, and messages
- **User Profiles** - View and edit user profiles with avatars
- **Search** - Search for users and content
- **Drafts** - Save and manage draft posts
- **Responsive Design** - Fully responsive UI for mobile and desktop

## 📋 Prerequisites

- Node.js v16 or higher
- npm or yarn package manager
- Backend API running (see backend README)

## 🛠️ Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 🚀 Running the Application

Development mode with hot reload:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

Lint code:
```bash
npm run lint
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Common/          # Shared components
│   │   ├── Feed/            # Feed-related components
│   │   ├── Post/            # Post components
│   │   ├── Story/           # Story components
│   │   ├── Message/         # Messaging components
│   │   ├── Profile/         # Profile components
│   │   └── ...
│   ├── Routes/              # Route definitions
│   ├── api/                 # API integration and services
│   ├── app/                 # Redux store and slices
│   ├── features/            # Feature-specific logic
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── App.jsx              # Main App component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── dist/                    # Production build output
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── eslint.config.js         # ESLint configuration
├── package.json
└── README.md
```

## 🎨 Key Technologies

### Framework & Build
- **React 18.2** - UI library
- **Vite** - Build tool and dev server
- **React Router v7** - Client-side routing

### State Management
- **Redux Toolkit** - Predictable state management
- **React Redux** - React bindings for Redux

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **@tailwindcss/vite** - Vite plugin for Tailwind

### API & Communication
- **Axios** - HTTP client for API calls
- **Socket.io Client** - Real-time communication

### UI Libraries & Tools
- **Lucide React** - Icon library
- **React Icons** - Additional icons
- **React Hot Toast** - Toast notifications
- **React Toastify** - Notification library
- **React Easy Crop** - Image cropping
- **React Medium Image Zoom** - Image zoom functionality
- **Emoji Mart** - Emoji picker

## 📁 Main Directories

### Components
Reusable React components organized by feature:
- Layout components (Header, Sidebar, etc.)
- Feed components
- Post creation and display
- Story creation and viewing
- Messaging interface
- Profile components
- Search functionality

### Routes
Application routing and page components

### API
- Service functions for backend communication
- Axios instance configuration
- API endpoint definitions

### App (Redux)
- Store configuration
- Redux slices for:
  - User authentication
  - Posts
  - Messages
  - Notifications
  - Stories
  - User profile

### Hooks
Custom React hooks for:
- API calls
- Authentication
- Socket.io events
- Form handling

### Utils
Helper functions for:
- Date/time formatting
- File handling
- String manipulation
- Local storage management

## 🔐 Authentication Flow

1. User enters credentials on login page
2. API authenticates and returns JWT token
3. Token stored in Redux store and localStorage
4. Token included in all API requests via Authorization header
5. Token validated by middleware and Socket.io

## 🔌 Socket.io Integration

Real-time features include:
- Message delivery notifications
- Online/offline status
- Typing indicators
- Push notifications
- Post activity updates

Connect to Socket.io in the main App component.

## 📡 API Integration

All API calls are managed through the `api/` directory. Example:

```javascript
import { useDispatch } from 'react-redux';
import { fetchPosts } from '../app/postsSlice';

function MyComponent() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);
  
  return <div>Posts</div>;
}
```

## 🎯 State Management with Redux

Redux store manages:
- User authentication state
- User profile data
- Posts and feed
- Messages and conversations
- Notifications
- Stories and highlights
- UI state (modals, loaders, etc.)

## 🛠️ Development Workflow

1. Create components in `components/`
2. Define Redux slices in `app/` if needed
3. Create API services in `api/`
4. Use custom hooks from `hooks/`
5. Style with Tailwind CSS classes
6. Test responsiveness

## 📱 Responsive Design

The application is fully responsive using Tailwind's responsive breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🎨 Styling

Uses Tailwind CSS for styling. Configuration in `tailwind.config.js`.

Common patterns:
- Utility-first approach
- Custom component classes for repeated patterns
- Responsive classes with breakpoints

## 🚀 Performance Optimizations

- Code splitting with React Router
- Image optimization
- Lazy loading components
- Redux for efficient state management
- Vite's fast build process

## 🧹 Code Quality

Run ESLint to check code quality:
```bash
npm run lint
```

## 🐛 Troubleshooting

### API Connection Issues
- Verify backend is running
- Check `VITE_API_URL` environment variable
- Review network tab in browser DevTools

### Authentication Issues
- Clear localStorage and cookies
- Check JWT token expiration
- Verify token in Authorization header

### Socket.io Connection Issues
- Verify backend Socket.io is running
- Check CORS settings
- Review console for connection errors

### Style Issues
- Ensure Tailwind classes are correct
- Clear browser cache
- Rebuild Tailwind CSS

## 📦 Building for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory ready for deployment.

## 🚀 Deployment

The built application can be deployed to:
- Vercel (Vite has built-in support)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## 📄 License

ISC

## 👥 Support

For issues and questions, contact the development team.
 
 
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

