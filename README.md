# Financial Advisor AI - Frontend

A modern Angular 17 application that provides an intelligent assistant interface for financial advisors to manage client communications, calendar events, and CRM data.

## 🚀 Overview

The Financial Advisor UI is a standalone Angular application that integrates with Google services (Gmail, Calendar) and HubSpot CRM to provide a unified chat interface powered by AI. Financial advisors can interact with their data through natural language queries and automate repetitive tasks using custom instructions.

## ✨ Key Features

### 🤖 AI-Powered Chat Interface
- Natural language conversation with an AI assistant
- Context-aware responses based on user data
- Real-time message streaming with typing indicators
- Chat history persistence and management

### 📧 Gmail Integration
- Automatic email synchronization
- Display recent emails with read/unread status
- Email search and filtering
- Background auto-sync for stale data (10-minute threshold)

### 📅 Google Calendar Integration
- Sync upcoming calendar events
- View meeting details with attendees and locations
- Automatic background synchronization
- Display event summaries and descriptions

### 🔶 HubSpot CRM Integration
- Connect to HubSpot account via OAuth
- Sync contacts, companies, and deals
- Real-time statistics dashboard
- Detailed view of CRM entities

### 🎯 Agent Instructions System
- Create custom automation rules
- Trigger-based instruction execution
- Activity logging and monitoring
- Priority-based instruction ordering
- Toggle instructions on/off

## 🏗️ Architecture

### Technology Stack
- **Framework**: Angular 17 (Standalone Components)
- **Language**: TypeScript 5.2
- **Styling**: Custom CSS with modern design patterns
- **HTTP Client**: Angular HttpClient with RxJS
- **State Management**: BehaviorSubject-based service layer
- **Routing**: Angular Router with lazy loading

### Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── auth-callback/       # Google OAuth callback handler
│   │   ├── chat/                # Main chat interface
│   │   ├── hubspot-callback/    # HubSpot OAuth callback handler
│   │   ├── instructions/        # Agent instructions management
│   │   └── login/               # Google login page
│   ├── models/
│   │   ├── calendar.model.ts    # Calendar event types
│   │   ├── chat.model.ts        # Chat message types
│   │   ├── email.model.ts       # Email types
│   │   ├── hubspot.model.ts     # HubSpot entity types
│   │   ├── instruction.model.ts # Instruction and activity types
│   │   └── user.model.ts        # User authentication types
│   ├── services/
│   │   ├── api.service.ts       # Base API service
│   │   ├── auth.service.ts      # Authentication management
│   │   ├── calendar.service.ts  # Calendar operations
│   │   ├── chat.service.ts      # Chat operations
│   │   ├── email.service.ts     # Email operations
│   │   ├── hubspot.service.ts   # HubSpot operations
│   │   └── instruction.service.ts # Instruction operations
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── environments/
│   ├── environment.ts           # Development config
│   └── environment.production.ts # Production config
└── styles.css
```

## 🎨 User Interface Design

### Design Philosophy
- **Modern & Clean**: Gradient backgrounds, soft shadows, rounded corners
- **Responsive**: Mobile-first approach with adaptive layouts
- **Accessible**: High contrast, semantic HTML, keyboard navigation
- **Intuitive**: Clear visual hierarchy and familiar interaction patterns

### Color Palette
- Primary: `#667eea` (Purple-blue gradient)
- Secondary: `#764ba2` (Deep purple)
- Success: `#48bb78` (Green)
- Error: `#e53e3e` (Red)
- Background: `#f7fafc` (Light gray)

### Key UI Components

#### Chat Interface
- Message bubbles with user/assistant distinction
- Timestamp and role indicators
- Typing indicator animation
- Auto-scroll to latest message
- Example prompts for new conversations

#### Data Sidebar
- Unified panel for Gmail, Calendar, and HubSpot
- Collapsible sections with toggle buttons
- Real-time sync status indicators
- Badge notifications for item counts
- Smooth slide-in/out animations

#### Instructions Manager
- Card-based instruction display
- Modal forms for create/edit operations
- Activity feed with unread notifications
- Toggle active/inactive status
- Priority and execution statistics

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Angular CLI 17+
- Backend API running (see backend README)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd financial-advisor-ui

# Install dependencies
npm install

# Configure environment
# Edit src/environments/environment.ts with your API URL
```

### Development Configuration

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7121/api'  // Your backend API URL
};
```

### Running the Application

```bash
# Development server (http://localhost:4200)
npm start

# Production build
npm run build

# Run tests
npm test

# Watch mode for development
npm run watch
```

## 🔐 Authentication Flow

### Google OAuth Integration

1. User clicks "Sign in with Google" on login page
2. Frontend requests auth URL from backend
3. User is redirected to Google OAuth consent screen
4. Google redirects back to `/auth/callback` with authorization code
5. Frontend exchanges code for tokens via backend
6. User session is stored in localStorage
7. User is redirected to chat interface

### Session Management
- User data stored in localStorage
- BehaviorSubject-based reactive state
- Auto-redirect to login if not authenticated
- Logout clears session and revokes tokens

## 📊 Data Synchronization

### Auto-Sync Strategy

The application implements intelligent background synchronization:

```typescript
// Stale data thresholds
Email & Calendar: 10 minutes
HubSpot: 15 minutes (less frequent due to rate limits)
```

**Sync Process:**
1. Load cached data immediately (instant UI)
2. Check sync status in background
3. Auto-sync if data is stale
4. Update UI when new data arrives

### Manual Sync
Users can manually trigger sync via buttons in the data panel:
- **Email**: Sync up to 50 recent emails
- **Calendar**: Sync upcoming events (full or incremental)
- **HubSpot**: Sync contacts, companies, and deals

## 🎯 Agent Instructions

### Instruction Types

Instructions can be triggered by:
- **All Sources**: Triggered by any data type
- **Email**: Triggered by email events
- **Calendar**: Triggered by calendar events
- **HubSpot**: Triggered by CRM updates

### Instruction Properties

```typescript
interface OngoingInstruction {
  id: number;
  instructionText: string;    // What the AI should do
  triggerType: string;        // When to trigger
  isActive: boolean;          // Enable/disable
  priority: number;           // Execution order (0-10)
  executionCount: number;     // Times executed
  lastExecutedAt?: string;    // Last run timestamp
}
```

### Agent Activities

All instruction executions are logged as activities:
- Activity type (e.g., EmailSent, CalendarEventCreated)
- Description of what happened
- Success/failure status
- Timestamp and read/unread state

## 🔄 State Management

### Service Layer Pattern

Each service manages its own state using RxJS BehaviorSubjects:

```typescript
// Example: AuthService
private currentUserSubject = new BehaviorSubject<User | null>(null);
public currentUser$ = this.currentUserSubject.asObservable();
```

**Benefits:**
- Reactive data flow
- Automatic UI updates
- Centralized state
- Type-safe observables

### Data Flow

```
User Action → Component → Service → HTTP Request → Backend
     ↓                                               ↓
UI Update ← Component ← Observable ← Response ← Backend
```

## 🎭 Component Breakdown

### ChatComponent
**Purpose**: Main chat interface with data sidebar

**Features:**
- Message list with auto-scroll
- Text input with keyboard shortcuts
- Data panel toggle
- Email, Calendar, and HubSpot sections
- Background auto-sync

**Key Methods:**
- `sendMessage()`: Send user message to AI
- `syncEmails()`: Trigger email sync
- `syncCalendar()`: Trigger calendar sync
- `loadAllCachedData()`: Load all cached data
- `checkAndAutoSyncAll()`: Auto-sync stale data

### InstructionsComponent
**Purpose**: Manage agent instructions and view activities

**Features:**
- Instruction CRUD operations
- Modal forms for create/edit
- Activity feed with notifications
- Toggle active/inactive status
- Priority management

**Key Methods:**
- `createInstruction()`: Create new instruction
- `updateInstruction()`: Update existing instruction
- `deleteInstruction()`: Delete instruction
- `toggleInstruction()`: Toggle active status
- `loadActivities()`: Load agent activities

### LoginComponent
**Purpose**: Google OAuth login page

**Features:**
- Google Sign-In button
- OAuth redirect handling
- Error message display
- Permission information

## 🌐 API Integration

### HTTP Interceptors

The application uses Angular's HttpClient with interceptors:

```typescript
provideHttpClient(withInterceptorsFromDi())
```

### Error Handling

All services implement error handling:

```typescript
this.http.get(url).subscribe({
  next: (response) => { /* handle success */ },
  error: (error) => {
    console.error('Error:', error);
    // Show user-friendly message
  }
});
```

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile: < 768px */
@media (max-width: 768px) {
  .data-sidebar.open { width: 320px; }
  .user-email { display: none; }
}
```

### Mobile Optimizations
- Hamburger menu for data panel
- Stacked layout for narrow screens
- Touch-friendly button sizes
- Simplified header on mobile

## 🎨 Styling Architecture

### CSS Organization
- Component-scoped styles
- Global styles in `styles.css`
- Consistent design tokens
- Utility classes for common patterns

### Animation Patterns

```css
/* Slide-in animation */
.data-sidebar {
  transition: width 0.3s ease;
}

/* Fade-in animation */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Spin animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

## 🔍 Key Features Implementation

### Auto-Scroll Chat
```typescript
ngAfterViewChecked() {
  if (this.shouldScrollToBottom) {
    this.scrollToBottom();
    this.shouldScrollToBottom = false;
  }
}
```

### Keyboard Shortcuts
```typescript
onKeyPress(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    this.sendMessage();
  }
}
```

### Toggle Lists
```typescript
toggleEmailList() {
  this.showEmailList = !this.showEmailList;
}
```

## 🚀 Deployment

### Production Build

```bash
npm run build
```

Output: `dist/financial-advisor-ui/`

### Environment Configuration

Update `src/environments/environment.production.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: '/api'  // Relative path for same-domain deployment
};
```

### Deployment Options

1. **Static Hosting** (Netlify, Vercel, Firebase)
   - Upload `dist/` folder
   - Configure rewrites for Angular routing

2. **Docker**
   - Use nginx to serve static files
   - Configure reverse proxy to backend API

3. **Cloud Platforms** (AWS S3, Azure, GCP)
   - Upload to storage bucket
   - Configure CDN for global delivery

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Test Configuration
- Framework: Jasmine & Karma
- Coverage: `karma-coverage`
- Component tests in `*.spec.ts` files

## 🐛 Common Issues & Solutions

### Issue: CORS Errors
**Solution**: Ensure backend CORS policy includes frontend origin

### Issue: OAuth Redirect Loop
**Solution**: Verify redirect URIs match in Google Console and backend config

### Issue: Data Not Syncing
**Solution**: Check API connection and user authentication status

## 📈 Performance Optimization

### Implemented Optimizations
- Lazy loading for routes
- Change detection strategy: OnPush (where applicable)
- RxJS operators for efficient data streams
- Background sync to prevent UI blocking
- Pagination for large data sets

### Bundle Size Management
```json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "500kb",
    "maximumError": "1mb"
  }
]
```

## 🛠️ Development Guidelines

### Code Style
- Use standalone components
- Prefer reactive patterns with RxJS
- Follow Angular style guide
- Keep components focused and small
- Use TypeScript strict mode

### Best Practices
- Unsubscribe from observables in ngOnDestroy
- Use async pipe in templates when possible
- Handle errors gracefully
- Provide loading states
- Add accessibility attributes

## 📚 Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [RxJS Documentation](https://rxjs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Material Design Guidelines](https://material.io/design)

**Version**: 0.0.0  
**Last Updated**: 2025  
**Angular Version**: 17.0.0
