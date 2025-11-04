// ============================================
// FILE 1: assets/js/validation.js (NEW FILE)
// Central validation logic for all inputs
// ============================================

export const Validator = {
    weight(value) {
        const weight = parseFloat(value);
        return {
            isValid: !isNaN(weight) && weight > 0 && weight <= 500,
            value: weight,
            error: 'Weight must be between 0 and 500 kg'
        };
    },
    
    calories(value) {
        const calories = parseInt(value);
        return {
            isValid: !isNaN(calories) && calories >= 0 && calories <= 10000,
            value: calories,
            error: 'Calories must be between 0 and 10000'
        };
    },
    
    weeks(value) {
        const weeks = parseInt(value);
        return {
            isValid: !isNaN(weeks) && weeks > 0 && weeks <= 104,
            value: weeks,
            error: 'Weeks must be between 1 and 104 (2 years)'
        };
    },
    
    maintenanceCalories(value) {
        const calories = parseInt(value);
        return {
            isValid: !isNaN(calories) && calories >= 1000 && calories <= 10000,
            value: calories,
            error: 'Maintenance calories must be between 1000 and 10000'
        };
    },
    
    pin(value) {
        return {
            isValid: /^\d{4}$/.test(value),
            value: value,
            error: 'PIN must be exactly 4 digits (0-9 only)'
        };
    },
    
    hydrationGoal(value) {
        const goal = parseInt(value);
        return {
            isValid: !isNaN(goal) && goal >= 1 && goal <= 20,
            value: goal,
            error: 'Hydration goal must be between 1 and 20 cups'
        };
    },
    
    mood(value) {
        const mood = parseInt(value);
        return {
            isValid: !isNaN(mood) && mood >= 1 && mood <= 5,
            value: mood,
            error: 'Mood must be between 1 and 5'
        };
    },
    
    cupIndex(value, max) {
        const index = parseInt(value);
        return {
            isValid: !isNaN(index) && index >= 0 && index < max,
            value: index,
            error: `Cup index must be between 0 and ${max - 1}`
        };
    },
    
    mealType(value) {
        const validMeals = ['breakfast', 'lunch', 'dinner', 'snacks'];
        return {
            isValid: validMeals.includes(value),
            value: value,
            error: 'Meal type must be: breakfast, lunch, dinner, or snacks'
        };
    }
};