# Temperature Gauge Dashboard

A real-time temperature sensor monitoring dashboard built with Angular 18, featuring live data visualization, temperature alerts, and comprehensive accessibility features.

![Angular](https://img.shields.io/badge/Angular-18.2-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Tests](https://img.shields.io/badge/Tests-132%20passing-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

🔴 **[Live Demo](https://kiril6.github.io/heat-sense/)**

## 📋 Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Security](#security)
- [Accessibility](#accessibility)
- [Performance](#performance)

## ✨ Features

### Core Functionality
- **Real-time Temperature Monitoring** - Live temperature data from multiple sensors
- **Interactive Gauges** - Visual circular gauge displays with SVG animations
- **Temperature Alerts** - Automatic notifications for critical temperatures (< 10°C or > 30°C)
  - Visual blinking animation on temperature display
  - Pulsing orange outline on affected gauges
  - Toast notifications with auto-dismissal when temperature normalizes
- **Expanded View** - Full-screen gauge view with auto-refresh every 10 seconds
- **Humidity Tracking** - Optional humidity monitoring with visual indicators
- **Outdated Data Detection** - Highlights sensors with data older than 15 minutes

### Data Management
- **Multiple View Modes**
  - Categorized view (Active, Outdated, Inactive)
  - All sensors view with collapsible sections
- **Favorites System** - Select and manage favorite sensors with reorder controls (left/right arrows)
- **Clear Favorites** - Quick action to remove all gauges from favorites
- **Manual Refresh** - Refresh individual gauges or all at once with "Refresh All" button
- **Data Persistence** - Preferences saved to localStorage

### UI/UX Features
- **Dark Mode** - System-wide dark theme toggle
- **Temperature Units** - Switch between Celsius and Fahrenheit
- **Responsive Design** - Mobile-friendly layout with Bulma CSS
- **Smooth Animations** - Fade, slide, and pulse effects
  - Animated header with gradient waves
  - Star blink animation on favorites section
- **Toast Notifications** - Non-intrusive notification system with manual dismissal
- **Offline Indicator** - Modal display when network connection is lost
- **Real-time Clock** - Live date and time display in header
- **Scroll to Top** - Button appears when scrolling down the page

### Accessibility Features
- **High Contrast Mode** - Enhanced visibility for users with visual impairments
- **Reduced Motion Mode** - Respects user preference for reduced animations
- **Keyboard Navigation** - Full keyboard support (ESC to close modals/expanded views)
- **ARIA Labels** - Proper semantic HTML and ARIA attributes
- **WCAG 2.1 AA Compliant** - Accessibility standards compliance

### Visual Indicators
- **Temperature Status Colors**
  - Cold (< 10°C): Blue with orange alert outline
  - Normal (10-30°C): Green
  - Hot (> 30°C): Red/Orange with orange alert outline
- **Humidity Icons**
  - Low (< 30%): Frown face
  - Optimal (30-70%): Smile face
  - High (> 70%): Neutral face
- **Status Badges**
  - Active: Success badge
  - Outdated: Warning badge with refresh action
  - Inactive: Danger badge

## 🛠 Technologies

### Frontend Framework
- **Angular 18.2** - Modern web framework with standalone components
- **TypeScript 5.5** - Type-safe JavaScript
- **RxJS 7.8** - Reactive programming library

### UI & Styling
- **Bulma 1.0.4** - Modern CSS framework
- **Font Awesome 7.1** - Icon library
- **CSS3** - Custom animations and transitions
- **Angular Animations** - Programmatic animations

### Testing
- **Jasmine 5.2** - Testing framework
- **Karma 6.4** - Test runner
- **Chrome Headless** - Browser for automated testing

### Architecture Patterns
- **Standalone Components** - Modern Angular component architecture
- **OnPush Change Detection** - Performance optimization
- **Service Layer** - Separation of concerns
- **Reactive Programming** - Observable-based data flow

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **Angular CLI** (v18.2 or higher)

```bash
# Check versions
node --version
npm --version

# Install Angular CLI globally
npm install -g @angular/cli
```

## 🚀 Installation

1. **Extract the zip file**
```bash
unzip temperature-gauge-app.zip
cd temperature-gauge-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Verify installation**
```bash
ng version
```

## 🏃 Running the Application

### Development Server

Start the development server with hot reload:

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/` in your browser. The application will automatically reload when you make changes to source files.

### Development Server with Custom Port

```bash
ng serve --port 4300
```

### Development Server with Open Browser

```bash
ng serve --open
```

## 🔨 Building for Production

### Standard Production Build

```bash
npm run build
# or
ng build
```

Build artifacts will be stored in the `dist/` directory.

### Production Build with Optimizations

```bash
ng build --configuration production
```

This enables:
- **Ahead-of-Time (AOT) compilation** - Faster rendering
- **Minification** - Smaller bundle size
- **Tree shaking** - Removes unused code
- **Source map removal** - Production-ready
- **Bundle optimization** - Compressed assets

### Build with Watch Mode

For continuous building during development:

```bash
npm run watch
# or
ng build --watch --configuration development
```

## 🧪 Testing

### Run All Tests

Execute the full test suite:

```bash
npm test
# or
ng test
```

This runs **132 tests** covering:
- Component functionality
- Service methods
- User interactions
- Accessibility features
- Temperature alerts
- Toast notifications
- Data validation

### Run Tests in Headless Mode

For CI/CD pipelines:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

### Run Tests with Code Coverage

```bash
ng test --code-coverage
```

Coverage reports will be generated in the `coverage/` directory.

### Test Specific Files

```bash
ng test --include='**/app.component.spec.ts'
```

## 📁 Project Structure

```
temperature-gauge-app/
├── public/
│   └── data/
│       └── temperature-array.json       # Mock sensor data
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── accessibility-modal/     # Accessibility settings modal
│   │   │   ├── offline-modal/           # Network status indicator
│   │   │   ├── temperature-gauge/       # Main gauge component
│   │   │   └── toast/                   # Toast notification system
│   │   ├── services/
│   │   │   └── temperature.service.ts   # Data management service
│   │   ├── app.component.ts             # Root component
│   │   ├── app.component.html           # Main template
│   │   └── app.component.scss           # Main styles
│   ├── assets/                          # Static assets
│   ├── styles.scss                      # Global styles
│   └── index.html                       # Entry point
├── SECURITY.md                          # Security documentation
├── package.json                         # Dependencies and scripts
├── angular.json                         # Angular configuration
├── tsconfig.json                        # TypeScript configuration
└── karma.conf.js                        # Test configuration
```

## ⚙️ Configuration

### Data Source

The application loads sensor data from `public/data/temperature-array.json`. This file contains mock sensor configurations:

```json
[
  {
    "id": "gauge-1",
    "label": "Living Room",
    "deviceId": "LR-TH-001",
    "currentTemp": 32,
    "minTemp": 10,
    "maxTemp": 40,
    "humidity": 45,
    "status": "active",
    "lastUpdated": "2026-01-13T18:30:00Z"
  }
]
```

You can modify this file to add, remove, or update sensor configurations. Each sensor requires:
- `id` - Unique identifier
- `label` - Display name
- `deviceId` - Device identifier
- `currentTemp` - Current temperature value
- `minTemp` / `maxTemp` - Temperature range
- `humidity` - (Optional) Humidity percentage
- `status` - "active" or "inactive"
- `lastUpdated` - ISO 8601 timestamp

### Temperature Thresholds

Defined in `app.component.ts`:

```typescript
TEMP_LOW_THRESHOLD = 10   // Celsius
TEMP_HIGH_THRESHOLD = 30  // Celsius
```

### Refresh Intervals

```typescript
EXPANDED_GAUGE_REFRESH_INTERVAL_MS = 10000    // 10 seconds
OUTDATED_DATA_THRESHOLD_MINUTES = 15          // 15 minutes
```

### Animation Durations

```typescript
REFRESH_ALL_ANIMATION_DURATION_MS = 2000      // 2 seconds
GAUGE_REFRESH_SPINNER_DURATION_MS = 1000      // 1 second
INITIAL_TOAST_DELAY_MS = 8000                 // 8 seconds
```

### LocalStorage Keys

The application stores user preferences:
- `temperatureUnit` - celsius/fahrenheit
- `darkMode` - true/false
- `selectedGauges` - Array of gauge IDs
- `viewMode` - categorized/all
- `highContrastMode` - true/false
- `reducedMotion` - true/false

## 🔒 Security

This application implements multiple security measures:

- **Content Security Policy (CSP)** - Prevents XSS attacks
- **Security Headers** - X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- **Input Validation** - Device ID and temperature data validation
- **No Dangerous APIs** - No use of innerHTML, eval(), or Function()
- **HTTPS/WSS Enforcement** - Secure connections only

For detailed security information, see **[SECURITY.md](SECURITY.md)**

### Security Best Practices

- Regular dependency audits: `npm audit`
- Update dependencies: `npm update`
- Follow OWASP Top 10 guidelines
- Implement rate limiting on API layer (production)
- Use environment variables for sensitive config

## ♿ Accessibility

The application meets **WCAG 2.1 AA** accessibility standards:

### Features
- **High Contrast Mode** - Toggle in accessibility modal
- **Reduced Motion** - Respects system preference and manual toggle
- **Keyboard Navigation** - Full keyboard support
- **Semantic HTML** - Proper heading structure and landmarks
- **ARIA Labels** - Screen reader support

### Keyboard Shortcuts
- `ESC` - Close modals or exit expanded view
- `Tab` - Navigate through interactive elements
- `Enter/Space` - Activate buttons and toggles

## ⚡ Performance

### Optimizations Implemented
- **OnPush Change Detection** - Reduces unnecessary renders
- **TrackBy Functions** - Efficient list rendering
- **Lazy Loading** - Components loaded on demand
- **RxJS Best Practices** - Proper subscription management
- **CSS Animations** - Hardware-accelerated transforms

## 📝 License

This project is licensed under the MIT License.

## 🐛 Reporting Issues

Found a bug or have a feature request? Please open an issue on GitHub.

For **security vulnerabilities**, please email security@example.com instead of creating a public issue.

## 📊 Project Statistics

- **Total Tests**: 132 (all passing)
- **Components**: 5 standalone components
- **Services**: 1 temperature service
- **Lines of Code**: ~3000+
- **Test Coverage**: Comprehensive unit tests
- **Angular Version**: 18.2.21
- **TypeScript Version**: 5.5.2

## 🔄 Recent Updates

### Latest Features (January 2026)
- ✨ Temperature alert blinking animation for critical values
- ✨ Automatic toast dismissal when temperature normalizes
- ✨ No immediate data refresh when entering expanded view
- ✨ Comprehensive meta tags (SEO, PWA, Open Graph, Twitter Card)
- ✨ Enhanced security headers and CSP configuration
- ✨ Accessibility modal with high contrast and reduced motion
- ✨ Orange pulsing outline for temperature alerts
- ✨ 132 comprehensive unit tests

## 📚 Additional Resources

- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [Angular Style Guide](https://angular.dev/style-guide)
- [SECURITY.md](SECURITY.md) - Detailed security documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

