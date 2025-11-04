# Bulk Tracker

A responsive, installable single-page web app for meal & sleep tracking during bulking phases. Built with vanilla HTML, CSS, and JavaScript - no frameworks required.

## Features

- **Meal Tracking**: Check off breakfast, lunch, dinner, and snacks with default calorie values
- **Sleep Monitoring**: Log sleep times and automatically calculate duration (handles crossing midnight)
- **Hydration Counter**: Track water intake with an 8-cup visual tracker
- **Mood Tracking**: Rate your daily mood with a 5-point emoji slider
- **Substitution System**: Add calories to other meals when skipping one
- **Statistics & Charts**: Visualize your progress with canvas-based charts
- **Goal Setting**: Set weight gain targets and track daily calorie requirements
- **Achievements**: Earn badges for consistency and milestones
- **Voice Commands**: Control the app with voice recognition
- **Offline First**: Works completely offline with local data storage
- **Data Export/Import**: Backup and restore your data as JSON
- **Progressive Web App**: Installable on mobile and desktop devices
- **Light/Dark Theme**: Toggle between light and dark modes
- **Weight Tracking**: Log and visualize your weight changes over time

## File Structure

```
bulk-tracker/
├── index.html
├── manifest.json
├── service-worker.js
├── README.md
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── ui.js
│   │   ├── storage.js
│   │   ├── analytics.js
│   │   ├── charts.js
│   │   └── voice.js
│   └── images/
└── .github/
    └── workflows/
        └── deploy.yml
```

## Getting Started

1. Clone or download this repository
2. Open `index.html` in your browser
3. Start tracking your meals and sleep!

The app works completely offline and stores all data in your browser's localStorage.

## Usage

### Daily Tracking
- Navigate to the "Today" tab to log your meals, sleep, water intake, and mood
- Click on meal items to mark them as completed
- Use the sleep inputs to track your sleep schedule
- Tap on water cups to track hydration
- Select your mood from the emoji slider

### Managing Substitutions
When you uncheck a meal, you'll be prompted to add substitution calories to another meal:
- Add 150 calories to snacks
- Add 250 calories to lunch
- Add 400 calories to dinner
- Or skip the substitution

### Viewing Statistics
- Go to the "Stats" tab to view your progress
- See 7-day, 14-day, and 30-day trends for calories and sleep
- Track your current streak and total meals logged
- View your weight tracking chart

### Setting Goals
- Navigate to the "Goals" tab
- Enter your current weight, target gain, timeframe, and maintenance calories
- View your progress toward your bulking goals

### Tracking Weight
- Go to the "Stats" tab
- Enter your current weight in the "Log Today's Weight" input
- Click "Save" to record your weight
- View your weight trend in the chart below

### Customizing Settings
- Go to the "Settings" tab to customize:
  - Default calorie values for each meal
  - Set or remove an app PIN for security

### Backup & Restore
- Use the "Backup" tab to:
  - Download a JSON backup of your data
  - Upload a previous backup to restore your data

## Voice Commands

The app supports voice commands for hands-free tracking:
- "Mark breakfast done"
- "Mark lunch done"
- "Mark dinner done"
- "Mark snacks done"
- "Export data"
- "Show stats"