// Main App Module
import { StorageManager } from './storage.js';
import { Charts } from './charts.js';
import { Analytics } from './analytics.js';
import { UI } from './ui.js';
import { Voice } from './voice.js';
import { Validator } from './validation.js';

const app = {
    data: null,
    currentDate: new Date().toISOString().split('T')[0],
    dateCheckInterval: null,
    pinAttempts: 0,
    MAX_PIN_ATTEMPTS: 3,
    
    async init() {
        try {
            this.data = StorageManager.getData();
            await this.checkPin();
            this.setupEventListeners();
            this.loadTheme();
            this.initTodayView();
            this.updateCurrentDate();
            this.checkBadges();
            this.registerServiceWorker();
        } catch (error) {
            console.error('Initialization error:', error);
            this.handleFatalError(error);
        }
    },
    
    handleFatalError(error) {
        document.body.innerHTML = `
            <div style="text-align:center;padding:4rem;color:var(--text-secondary);font-family:system-ui;">
                <h1 style="font-size:2rem;margin-bottom:1rem;color:var(--text-primary);">⚠️ Error Loading App</h1>
                <p style="margin-bottom:2rem;">${error.message}</p>
                <button onclick="location.reload()" style="padding:0.75rem 1.5rem;border-radius:0.5rem;border:none;background:#6366f1;color:white;cursor:pointer;font-size:1rem;">
                    Retry
                </button>
            </div>
        `;
    },
    
    async checkPin() {
        if (!this.data.userSettings.pinHash) return;
        
        while (this.pinAttempts < this.MAX_PIN_ATTEMPTS) {
            const pin = prompt(`🔒 Enter PIN to access Bulk Tracker\n\nAttempt ${this.pinAttempts + 1} of ${this.MAX_PIN_ATTEMPTS}:`);
            
            if (pin === null) {
                throw new Error('PIN entry cancelled by user');
            }
            
            const validation = Validator.pin(pin);
            if (!validation.isValid) {
                alert(validation.error);
                continue;
            }
            
            if (await this.hashPin(pin) === this.data.userSettings.pinHash) {
                this.pinAttempts = 0;
                return;
            }
            
            this.pinAttempts++;
            if (this.pinAttempts < this.MAX_PIN_ATTEMPTS) {
                alert(`❌ Invalid PIN\n\n${this.MAX_PIN_ATTEMPTS - this.pinAttempts} attempts remaining.`);
            }
        }
        
        throw new Error('Maximum PIN attempts exceeded. Access denied.');
    },
    
    async hashPin(pin) {
        const encoder = new TextEncoder();
        const data = encoder.encode(pin);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },
    
    async setPin() {
        const input = document.getElementById('pin-input');
        if (!input) return;
        
        const pin = input.value;
        const validation = Validator.pin(pin);
        
        if (!validation.isValid) {
            alert(validation.error);
            return;
        }
        
        this.data.userSettings.pinHash = await this.hashPin(validation.value);
        this.saveData();
        alert('✓ PIN set successfully!\n\nYou will need to enter this PIN when opening the app.');
        input.value = '';
    },
    
    clearPin() {
        if (confirm('⚠️ Remove PIN protection?\n\nThe app will no longer require a PIN to access.')) {
            this.data.userSettings.pinHash = null;
            this.saveData();
            alert('✓ PIN protection removed.');
        }
    },
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.currentTarget.dataset.section);
            });
        });
        
        // Theme toggle
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => this.toggleTheme());
        }
        
        // Sleep inputs
        const sleepFrom = document.getElementById('sleep-from');
        const sleepTo = document.getElementById('sleep-to');
        if (sleepFrom) sleepFrom.addEventListener('change', () => this.calculateSleep());
        if (sleepTo) sleepTo.addEventListener('change', () => this.calculateSleep());
        
        // Voice button
        const voiceBtn = document.getElementById('voice-btn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                Voice.startVoiceRecognition((command) => {
                    Voice.handleVoiceCommand(command, this);
                });
            });
        }
        
        // Notifications
        const notifBtn = document.getElementById('notifications-btn');
        if (notifBtn) {
            notifBtn.addEventListener('click', () => this.requestNotifications());
        }
        
        // File import
        const importFile = document.getElementById('import-file');
        if (importFile) {
            importFile.addEventListener('change', (e) => this.importData(e));
        }
        
        // Fitness goal selection
        const fitnessGoalSelect = document.getElementById('fitness-goal');
        if (fitnessGoalSelect) {
            fitnessGoalSelect.addEventListener('change', () => this.toggleGoalFields());
        }
        
        // Event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            // Chart buttons
            const chartBtn = e.target.closest('.chart-btn');
            if (chartBtn) {
                const type = chartBtn.dataset.type;
                const days = parseInt(chartBtn.dataset.days);
                this.updateChart(type, days, chartBtn);
                return;
            }
            
            // Meal items
            const mealItem = e.target.closest('.meal-item');
            if (mealItem) {
                const mealId = mealItem.dataset.meal;
                const mealData = this.data.logs[this.currentDate]?.meals[mealId];
                
                if (mealData && !mealData.done) {
                    // Show confirmation dialog before marking as completed
                    const totalCalories = Object.values(this.data.logs[this.currentDate].meals).reduce((sum, meal) => {
                        return sum + (meal && meal.done ? meal.calories : 0);
                    }, 0);
                    
                    const confirmed = confirm(`Total calories consumed so far: ${totalCalories + mealData.calories} kcal\n\nAre you sure you want to mark this meal as completed?`);
                    if (!confirmed) return;
                }
                
                this.toggleMeal(mealId);
                return;
            }
            
            // Hydration cups
            const cup = e.target.closest('.cup');
            if (cup) {
                this.toggleCup(parseInt(cup.dataset.cup));
                return;
            }
            
            // Mood options
            const moodOption = e.target.closest('.mood-option');
            if (moodOption) {
                this.setMood(parseInt(moodOption.dataset.mood));
                return;
            }
        });
        
        // Modal backdrop click
        const modal = document.getElementById('substitution-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    UI.closeModal();
                }
            });
        }
        
        // Date change checker (runs every minute)
        this.dateCheckInterval = setInterval(() => {
            const today = new Date().toISOString().split('T')[0];
            if (this.currentDate !== today) {
                this.currentDate = today;
                this.initTodayView();
                this.updateCurrentDate();
            }
        }, 60000);
    },
    
    switchSection(sectionId) {
        // Update sections
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        
        const section = document.getElementById(sectionId);
        const navBtn = document.querySelector(`[data-section="${sectionId}"]`);
        
        if (section) section.classList.add('active');
        if (navBtn) navBtn.classList.add('active');
        
        // Load section-specific data
        if (sectionId === 'stats') this.loadStats();
        if (sectionId === 'goals') this.loadGoals();
        if (sectionId === 'settings') this.loadSettings();
        if (sectionId === 'badges') this.checkBadges();
    },
    
    loadTheme() {
        const theme = this.data.userSettings.theme;
        document.documentElement.setAttribute('data-theme', theme);
        this.updateLogoForTheme(theme);
        
        const icon = document.getElementById('theme-toggle');
        if (icon) {
            icon.innerHTML = theme === 'dark' 
                ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
                : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
        }
    },
    
    updateLogoForTheme(theme) {
        const logoContainer = document.querySelector('.logo');
        if (!logoContainer) return;
        
        const textSpan = logoContainer.querySelector('span');
        const textContent = textSpan ? textSpan.textContent : 'Bulk Tracker';
        
        if (theme === 'dark') {
            logoContainer.innerHTML = `
                <img src="./assets/images/berserk-logo.jpg" alt="Bulk Tracker Logo" class="app-logo">
                <span>${textContent}</span>
            `;
        } else {
            logoContainer.innerHTML = `
                <picture>
                    <source srcset="./assets/images/logo.avif" type="image/avif">
                    <img src="./assets/images/logo.png" alt="Bulk Tracker Logo" class="app-logo">
                </picture>
                <span>${textContent}</span>
            `;
        }
    },
    
    toggleTheme() {
        this.data.userSettings.theme = this.data.userSettings.theme === 'light' ? 'dark' : 'light';
        this.loadTheme();
        this.saveData();
    },
    
    updateCurrentDate() {
        const date = new Date();
        const shortDate = document.getElementById('current-date');
        const fullDate = document.getElementById('current-date-full');
        
        if (shortDate) {
            shortDate.textContent = date.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric'
            });
        }
        
        if (fullDate) {
            fullDate.textContent = date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
    },
    
    initTodayView() {
        this.ensureTodayLog();
        UI.renderMeals(this.data, this.currentDate);
        UI.renderHydration(this.data, this.currentDate);
        UI.renderMood(this.data, this.currentDate);
        this.loadSleep();
        this.updateTotals();
    },
    
    ensureTodayLog() {
        if (!this.data.logs[this.currentDate]) {
            this.data.logs[this.currentDate] = {
                meals: this.createDefaultMeals(),
                sleep: { from: '', to: '', hours: 0 },
                waterCups: 0,
                mood: 0,
                notes: '',
                timestamp: Date.now()
            };
            this.saveData();
        }
    },
    
    createDefaultMeals() {
        const defaults = this.data.userSettings.defaultMealCalories;
        return {
            breakfast: { done: false, calories: defaults.breakfast, substitutionFrom: null },
            lunch: { done: false, calories: defaults.lunch, substitutionFrom: null },
            dinner: { done: false, calories: defaults.dinner, substitutionFrom: null },
            snacks: { done: false, calories: defaults.snacks, substitutionFrom: null }
        };
    },
    
    toggleMeal(mealId) {
        this.ensureTodayLog();
        
        const validation = Validator.mealType(mealId);
        if (!validation.isValid) {
            console.error(validation.error);
            return;
        }
        
        const meal = this.data.logs[this.currentDate].meals[mealId];
        if (!meal) {
            console.error(`Meal ${mealId} not found`);
            return;
        }
        
        const wasChecked = meal.done;
        meal.done = !meal.done;
        
        if (!meal.done && wasChecked) {
            UI.showSubstitutionModal(mealId, (targetMeal, calories) => {
                this.addSubstitution(targetMeal, calories);
            });
        }
        
        this.saveData();
        this.updateUI();
    },
    
    addSubstitution(targetMeal, calories) {
        this.ensureTodayLog();
        
        const mealValidation = Validator.mealType(targetMeal);
        if (!mealValidation.isValid) {
            console.error(mealValidation.error);
            return;
        }
        
        const caloriesValidation = Validator.calories(calories);
        if (!caloriesValidation.isValid) {
            console.error(caloriesValidation.error);
            return;
        }
        
        const meal = this.data.logs[this.currentDate].meals[targetMeal];
        if (!meal) {
            console.error(`Target meal ${targetMeal} not found`);
            return;
        }
        
        meal.calories += caloriesValidation.value;
        this.saveData();
        this.updateUI();
    },
    
    toggleCup(index) {
        this.ensureTodayLog();
        
        const hydrationGoal = this.data.userSettings.hydrationGoal;
        const validation = Validator.cupIndex(index, hydrationGoal);
        
        if (!validation.isValid) {
            console.error(validation.error);
            return;
        }
        
        const current = this.data.logs[this.currentDate].waterCups;
        this.data.logs[this.currentDate].waterCups = index + 1 === current ? index : index + 1;
        
        this.saveData();
        UI.renderHydration(this.data, this.currentDate);
        this.checkBadges();
    },
    
    resetHydration() {
        this.ensureTodayLog();
        this.data.logs[this.currentDate].waterCups = 0;
        this.saveData();
        UI.renderHydration(this.data, this.currentDate);
        this.checkBadges();
    },
    
    setMood(value) {
        this.ensureTodayLog();
        
        const validation = Validator.mood(value);
        if (!validation.isValid) {
            console.error(validation.error);
            return;
        }
        
        this.data.logs[this.currentDate].mood = validation.value;
        this.saveData();
        UI.renderMood(this.data, this.currentDate);
    },
    
    loadSleep() {
        const sleep = this.data.logs[this.currentDate]?.sleep;
        const fromInput = document.getElementById('sleep-from');
        const toInput = document.getElementById('sleep-to');
        
        if (fromInput) fromInput.value = sleep?.from || '';
        if (toInput) toInput.value = sleep?.to || '';
        
        this.calculateSleep();
    },
    
    loadMacros() {
        const log = this.data.logs[this.currentDate];
        if (!log) return;
        
        const proteinInput = document.getElementById('protein-input');
        const carbsInput = document.getElementById('carbs-input');
        
        if (proteinInput) proteinInput.value = log.protein || 0;
        if (carbsInput) carbsInput.value = log.carbs || 0;
    },
    
    calculateSleep() {
        const fromInput = document.getElementById('sleep-from');
        const toInput = document.getElementById('sleep-to');
        
        const from = fromInput?.value;
        const to = toInput?.value;
        
        if (!from || !to) {
            this.updateSleepDisplay(0);
            return;
        }
        
        const [fromH, fromM] = from.split(':').map(Number);
        const [toH, toM] = to.split(':').map(Number);
        
        let fromMinutes = fromH * 60 + fromM;
        let toMinutes = toH * 60 + toM;
        
        let diff = toMinutes - fromMinutes;
        if (diff < 0) diff += 1440; // Handle crossing midnight
        
        const hours = parseFloat((diff / 60).toFixed(1));
        
        this.ensureTodayLog();
        this.data.logs[this.currentDate].sleep = { from, to, hours };
        this.saveData();
        this.updateSleepDisplay(hours);
        this.checkBadges();
    },
    
    updateSleepDisplay(hours) {
        const elements = ['sleep-hours', 'total-sleep'];
        elements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = hours.toFixed(1);
        });
    },
    
    updateUI() {
        UI.renderMeals(this.data, this.currentDate);
        this.updateTotals();
        this.loadMacros();
        this.checkBadges();
    },
    
    updateTotals() {
        const meals = this.data.logs[this.currentDate]?.meals;
        if (!meals) return;
        
        const total = Analytics.calculateDailyCalories(this.data, this.currentDate);
        
        const el = document.getElementById('total-calories');
        if (el) el.textContent = total;
    },
    
    loadStats() {
        this.calculateStats();
        
        // Initialize all charts
        ['calories', 'sleep', 'weight'].forEach(type => {
            this.updateChart(type, 7);
            
            // Set active button state
            const buttons = document.querySelectorAll(`[data-type="${type}"]`);
            buttons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.days === '7');
            });
        });
    },
    
    calculateStats() {
        const stats = Analytics.calculateStats(this.data, this.currentDate);
        
        const elements = {
            'avg-calories-7': stats.avgCalories,
            'avg-sleep-7': stats.avgSleep,
            'current-streak': stats.streak,
            'total-meals': stats.totalMeals
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });
    },
    
    saveWeight() {
        const input = document.getElementById('weight-input');
        if (!input) return;
        
        const validation = Validator.weight(input.value);
        if (!validation.isValid) {
            alert(validation.error);
            return;
        }
        
        if (!this.data.weightLogs) this.data.weightLogs = {};
        this.data.weightLogs[this.currentDate] = validation.value;
        this.saveData();
        
        input.value = '';
        
        // Update chart with current active button
        const activeButton = document.querySelector('[data-type="weight"].active');
        const days = activeButton ? parseInt(activeButton.dataset.days) : 7;
        this.updateChart('weight', days);
        
        alert('✓ Weight saved successfully!');
    },
    
    updateChart(type, days, buttonElement) {
        const canvas = document.getElementById(`${type}-chart`);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Update active button state
        if (buttonElement) {
            const container = buttonElement.closest('.chart-controls');
            if (container) {
                container.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                buttonElement.classList.add('active');
            }
        }
        
        let dates, data;
        
        if (type === 'weight') {
            const weightDates = Object.keys(this.data.weightLogs || {}).sort();
            dates = weightDates.slice(-days);
            data = dates.map(date => this.data.weightLogs[date] || 0);
        } else {
            const allDates = Object.keys(this.data.logs).sort();
            dates = allDates.slice(-days);
            data = dates.map(date => {
                if (type === 'calories') {
                    return Analytics.calculateDailyCalories(this.data, date);
                } else {
                    return this.data.logs[date]?.sleep?.hours || 0;
                }
            });
        }
        
        Charts.drawChart(ctx, canvas, data, dates, type);
    },
    
    loadGoals() {
        const fields = {
            'current-weight': this.data.userSettings.weightKg,
            'target-weight': this.data.userSettings.targetKg,
            'target-weeks': this.data.userSettings.targetWeeks,
            'maintenance-calories': this.data.userSettings.maintenanceCalories,
            'fitness-goal': this.data.userSettings.fitnessGoal || 'bulk',
            'cutting-intensity': this.data.userSettings.cuttingIntensity || 'moderate'
        };
        
        // Handle target weight field based on fitness goal
        const fitnessGoal = this.data.userSettings.fitnessGoal || 'bulk';
        if (fitnessGoal === 'cut') {
            fields['target-fat-loss'] = this.data.userSettings.targetKg;
        } else {
            fields['target-weight'] = this.data.userSettings.targetKg;
        }
        
        Object.entries(fields).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.value = value;
        });
        
        // Toggle goal fields based on fitness goal
        this.toggleGoalFields();
        
        this.updateGoalProgress();
    },
    
    saveGoals() {
        const fitnessGoal = document.getElementById('fitness-goal').value;
        
        // Set up fields based on fitness goal
        let fields;
        if (fitnessGoal === 'cut') {
            fields = [
                { id: 'current-weight', validator: Validator.weight, key: 'weightKg', name: 'current weight' },
                { id: 'target-fat-loss', validator: Validator.weight, key: 'targetKg', name: 'target fat loss' },
                { id: 'target-weeks', validator: Validator.weeks, key: 'targetWeeks', name: 'timeframe' },
                { id: 'maintenance-calories', validator: Validator.maintenanceCalories, key: 'maintenanceCalories', name: 'maintenance calories' }
            ];
        } else {
            fields = [
                { id: 'current-weight', validator: Validator.weight, key: 'weightKg', name: 'current weight' },
                { id: 'target-weight', validator: Validator.weight, key: 'targetKg', name: 'target gain' },
                { id: 'target-weeks', validator: Validator.weeks, key: 'targetWeeks', name: 'timeframe' },
                { id: 'maintenance-calories', validator: Validator.maintenanceCalories, key: 'maintenanceCalories', name: 'maintenance calories' }
            ];
        }
        
        // Add fitness goal and cutting intensity
        const cuttingIntensity = document.getElementById('cutting-intensity').value;
        
        const values = {
            fitnessGoal: fitnessGoal,
            cuttingIntensity: cuttingIntensity
        };
        
        for (const field of fields) {
            const input = document.getElementById(field.id);
            if (!input) continue;
            
            const validation = field.validator(input.value);
            if (!validation.isValid) {
                alert(`❌ Invalid ${field.name}:\n\n${validation.error}`);
                return;
            }
            values[field.key] = validation.value;
        }
        
        Object.assign(this.data.userSettings, values);
        this.saveData();
        this.updateGoalProgress();
        alert('✓ Goals saved successfully!');
    },
    
    updateGoalProgress() {
        const progress = Analytics.calculateGoalProgress(this.data);
        
        const detailsEl = document.getElementById('goal-details');
        if (!detailsEl) return;
        
        const fitnessGoal = this.data.userSettings.fitnessGoal || 'bulk';
        const cuttingIntensity = this.data.userSettings.cuttingIntensity || 'moderate';
        
        let targetLabel = 'Target daily calories';
        let requiredLabel = 'Required surplus';
        let requiredValue = `+${progress.dailySurplusRequired} kcal/day`;
        
        if (fitnessGoal === 'cut') {
            requiredLabel = 'Required deficit';
            requiredValue = `-${Math.abs(progress.dailySurplusRequired)} kcal/day`;
        }
        
        detailsEl.innerHTML = `
            <div class="goal-stat">
                <span class="goal-stat-label">${targetLabel}</span>
                <span class="goal-stat-value">${progress.targetDaily} kcal</span>
            </div>
            <div class="goal-stat">
                <span class="goal-stat-label">${requiredLabel}</span>
                <span class="goal-stat-value">${requiredValue}</span>
            </div>
            <div class="goal-stat">
                <span class="goal-stat-label">Your 7-day average</span>
                <span class="goal-stat-value">${progress.avgActual} kcal</span>
            </div>
            <div class="goal-stat">
                <span class="goal-stat-label">Progress</span>
                <span class="goal-stat-value">${progress.progress}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress.clampedProgress}%"></div>
            </div>
        `;
    },
    
    checkBadges() {
        const badges = UI.renderBadges(this.data, this.currentDate);
        
        badges.forEach(badge => {
            const unlocked = badge.check();
            if (unlocked && !this.data.badges.includes(badge.id)) {
                this.data.badges.push(badge.id);
                this.saveData();
                UI.showConfetti();
            }
        });
    },
    
    loadSettings() {
        const { defaultMealCalories, hydrationGoal } = this.data.userSettings;
        
        const fields = {
            'cal-breakfast': defaultMealCalories.breakfast,
            'cal-lunch': defaultMealCalories.lunch,
            'cal-dinner': defaultMealCalories.dinner,
            'cal-snacks': defaultMealCalories.snacks,
            'hydration-goal': hydrationGoal || 8
        };
        
        Object.entries(fields).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.value = value;
        });
    },
    
    saveSettings() {
        const newCalories = {};
        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
        
        // Validate all inputs
        for (const mealType of mealTypes) {
            const input = document.getElementById(`cal-${mealType}`);
            if (!input) continue;
            
            const validation = Validator.calories(input.value);
            if (!validation.isValid) {
                alert(`❌ Invalid ${mealType} calories:\n\n${validation.error}`);
                return;
            }
            newCalories[mealType] = validation.value;
        }
        
        const oldCalories = this.data.userSettings.defaultMealCalories;
        this.data.userSettings.defaultMealCalories = newCalories;
        
        // Update today's uncompleted meals
        this.ensureTodayLog();
        const todayMeals = this.data.logs[this.currentDate].meals;
        
        mealTypes.forEach(mealType => {
            const meal = todayMeals[mealType];
            if (meal && !meal.done && meal.calories === oldCalories[mealType]) {
                meal.calories = newCalories[mealType];
            }
        });
        
        this.saveData();
        this.updateUI();
        alert('✓ Settings saved successfully!');
    },
    
    saveHydrationSettings() {
        const input = document.getElementById('hydration-goal');
        if (!input) return;
        
        const validation = Validator.hydrationGoal(input.value);
        if (!validation.isValid) {
            alert(`❌ ${validation.error}`);
            return;
        }
        
        this.data.userSettings.hydrationGoal = validation.value;
        this.saveData();
        UI.renderHydration(this.data, this.currentDate);
        alert('✓ Hydration goal saved successfully!');
    },
    
    toggleGoalFields() {
        const fitnessGoal = document.getElementById('fitness-goal').value;
        const cuttingIntensityGroup = document.getElementById('cutting-intensity-group');
        const targetGainGroup = document.getElementById('target-gain-group');
        const targetLossGroup = document.getElementById('target-loss-group');
        
        if (fitnessGoal === 'cut') {
            cuttingIntensityGroup.style.display = 'block';
            targetGainGroup.style.display = 'none';
            targetLossGroup.style.display = 'block';
        } else {
            cuttingIntensityGroup.style.display = 'none';
            targetGainGroup.style.display = 'block';
            targetLossGroup.style.display = 'none';
        }
    },
    
    saveMacros() {
        const proteinInput = document.getElementById('protein-input');
        const carbsInput = document.getElementById('carbs-input');
        
        if (!proteinInput || !carbsInput) return;
        
        const protein = parseInt(proteinInput.value) || 0;
        const carbs = parseInt(carbsInput.value) || 0;
        
        this.ensureTodayLog();
        this.data.logs[this.currentDate].protein = protein;
        this.data.logs[this.currentDate].carbs = carbs;
        this.saveData();
        
        proteinInput.value = '';
        carbsInput.value = '';
        
        alert('✓ Macros saved successfully!');
    },
    
    resetData() {
        const confirmed = confirm('⚠️ ARE YOU SURE?\n\nThis will permanently erase ALL your data including:\n- Meal logs\n- Weight records\n- Sleep data\n- Hydration logs\n- Mood ratings\n- Settings\n\nThis action cannot be undone. Do you want to continue?');
            
        if (confirmed) {
            // Clear all data from localStorage
            localStorage.clear();
                
            // Reload the page to reset the app
            alert('✓ All data has been erased.\n\nThe app will now reload.');
            location.reload();
        }
    },
    
    exportData() {
        if (StorageManager.exportData(this.data)) {
            // Success is handled by the browser download
        } else {
            alert('❌ Failed to export data. Please try again.');
        }
    },
    
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                
                if (!StorageManager.validateImportData(imported)) {
                    alert('❌ Invalid backup file format.\n\nPlease select a valid Bulk Tracker backup file.');
                    return;
                }
                
                if (confirm('⚠️ This will replace all your current data.\n\nDo you want to continue?')) {
                    this.data = StorageManager.validateAndMigrate(imported);
                    this.saveData();
                    alert('✓ Data imported successfully!\n\nThe page will now reload.');
                    location.reload();
                }
            } catch (err) {
                alert(`❌ Error importing file:\n\n${err.message}`);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    },
    
    requestNotifications() {
        if (!('Notification' in window)) {
            alert('❌ Notifications are not supported in your browser.');
            return;
        }
        
        if (Notification.permission === 'granted') {
            alert('✓ Notifications are already enabled!');
            this.data.userSettings.notificationsEnabled = true;
            this.saveData();
            return;
        }
        
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                this.data.userSettings.notificationsEnabled = true;
                this.saveData();
                new Notification('Bulk Tracker', {
                    body: '✓ Notifications enabled! We\'ll remind you to log your meals.',
                    icon: './assets/images/logo.png'
                });
            } else {
                alert('❌ Notification permission denied.\n\nYou can enable notifications in your browser settings.');
            }
        });
    },
    
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./service-worker.js')
                    .then(reg => console.log('✓ ServiceWorker registered:', reg.scope))
                    .catch(err => console.log('❌ ServiceWorker registration failed:', err));
            });
        }
    },
    
    saveData() {
        if (!StorageManager.saveData(this.data)) {
            alert('❌ Error saving data.\n\nYour storage may be full. Please export your data and clear old logs.');
        }
    },
    
    cleanup() {
        if (this.dateCheckInterval) {
            clearInterval(this.dateCheckInterval);
        }
    }
};

// Initialize app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Make app globally accessible for inline event handlers
window.app = app;

// Cleanup on page unload
window.addEventListener('beforeunload', () => app.cleanup());