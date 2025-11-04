// Storage Manager
export const StorageManager = {
    VERSION: 'bulk-tracker-v2',
    LEGACY_VERSION: 'bulk-tracker-v1',
    
    getData() {
        try {
            // Try to load v2 data first
            let data = localStorage.getItem(this.VERSION);
            
            // If v2 doesn't exist, try migrating from v1
            if (!data) {
                const legacyData = localStorage.getItem(this.LEGACY_VERSION);
                if (legacyData) {
                    console.log('Migrating from v1 to v2...');
                    const parsed = JSON.parse(legacyData);
                    const migrated = this.validateAndMigrate(parsed);
                    this.saveData(migrated);
                    return migrated;
                }
                return this.getDefaultData();
            }
            
            const parsed = JSON.parse(data);
            return this.validateAndMigrate(parsed);
        } catch (e) {
            console.error('Error loading data:', e);
            return this.getDefaultData();
        }
    },
    
    validateAndMigrate(data) {
        const defaultData = this.getDefaultData();
        
        // Ensure all required top-level keys exist
        if (!data || typeof data !== 'object') {
            return defaultData;
        }
        
        // Deep merge user settings
        const userSettings = {
            ...defaultData.userSettings,
            ...(data.userSettings || {}),
            defaultMealCalories: {
                ...defaultData.userSettings.defaultMealCalories,
                ...(data.userSettings?.defaultMealCalories || {})
            }
        };
        
        // Validate and clean logs
        const logs = this.validateLogs(data.logs || {}, userSettings);
        
        return {
            userSettings,
            logs,
            weightLogs: data.weightLogs && typeof data.weightLogs === 'object' ? data.weightLogs : {},
            badges: Array.isArray(data.badges) ? data.badges : []
        };
    },
    
    validateLogs(logs, userSettings) {
        const validatedLogs = {};
        const defaults = userSettings.defaultMealCalories;
        
        Object.keys(logs).forEach(date => {
            // Validate date format (YYYY-MM-DD)
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
            
            const log = logs[date];
            if (!log || typeof log !== 'object') return;
            
            // Validate meals
            const meals = {};
            ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
                const meal = log.meals?.[mealType];
                meals[mealType] = {
                    done: meal?.done === true,
                    calories: typeof meal?.calories === 'number' ? meal.calories : defaults[mealType],
                    substitutionFrom: meal?.substitutionFrom || null
                };
            });
            
            // Validate sleep
            const sleep = {
                from: typeof log.sleep?.from === 'string' ? log.sleep.from : '',
                to: typeof log.sleep?.to === 'string' ? log.sleep.to : '',
                hours: typeof log.sleep?.hours === 'number' ? log.sleep.hours : 0
            };
            
            // Validate other fields
            validatedLogs[date] = {
                meals,
                sleep,
                waterCups: typeof log.waterCups === 'number' ? Math.max(0, log.waterCups) : 0,
                mood: typeof log.mood === 'number' ? Math.max(0, Math.min(5, log.mood)) : 0,
                notes: typeof log.notes === 'string' ? log.notes : '',
                timestamp: typeof log.timestamp === 'number' ? log.timestamp : Date.now(),
                protein: typeof log.protein === 'number' ? Math.max(0, log.protein) : 0,
                carbs: typeof log.carbs === 'number' ? Math.max(0, log.carbs) : 0
            };
        });
        
        return validatedLogs;
    },
    
    getDefaultData() {
        return {
            userSettings: {
                theme: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
                weightKg: 75,
                targetKg: 4,
                targetWeeks: 8,
                maintenanceCalories: 2400,
                defaultMealCalories: {
                    breakfast: 600,
                    lunch: 700,
                    dinner: 700,
                    snacks: 300
                },
                hydrationGoal: 8,
                pinHash: null,
                notificationsEnabled: false,
                fitnessGoal: 'bulk', // 'bulk' or 'cut'
                cuttingIntensity: 'moderate' // 'slow', 'moderate', or 'aggressive'
            },
            logs: {},
            weightLogs: {},
            badges: []
        };
    },
    
    saveData(data) {
        try {
            const jsonString = JSON.stringify(data);
            localStorage.setItem(this.VERSION, jsonString);
            return true;
        } catch (e) {
            console.error('Error saving data:', e);
            if (e.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Please export your data and clear old logs.');
            }
            return false;
        }
    },
    
    exportData(data) {
        try {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bulk-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        } catch (e) {
            console.error('Error exporting data:', e);
            return false;
        }
    },
    
    validateImportData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.userSettings || typeof data.userSettings !== 'object') return false;
        if (!data.logs || typeof data.logs !== 'object') return false;
        return true;
    }
};