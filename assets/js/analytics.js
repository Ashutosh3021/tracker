// Analytics module
export const Analytics = {
    calculateStats(data, currentDate) {
        const dates = Object.keys(data.logs || {}).sort().slice(-7);
        
        if (dates.length === 0) {
            return {
                avgCalories: 0,
                avgSleep: 0.0,
                streak: 0,
                totalMeals: 0
            };
        }
        
        const avgCalories = dates.reduce((sum, date) => {
            return sum + this.calculateDailyCalories(data, date);
        }, 0) / dates.length;
        
        const avgSleep = dates.reduce((sum, date) => {
            return sum + (data.logs[date]?.sleep?.hours || 0);
        }, 0) / dates.length;
        
        const streak = this.calculateStreak(data);
        const totalMeals = dates.reduce((sum, date) => {
            const meals = data.logs[date]?.meals || {};
            return sum + Object.values(meals).filter(m => m?.done).length;
        }, 0);
        
        return {
            avgCalories: Math.round(avgCalories),
            avgSleep: avgSleep.toFixed(1),
            streak,
            totalMeals
        };
    },
    
    calculateDailyCalories(data, date) {
        const meals = data.logs[date]?.meals;
        if (!meals) return 0;
        
        const defaults = data.userSettings.defaultMealCalories;
        let total = 0;
        
        Object.entries(meals).forEach(([mealType, meal]) => {
            if (!meal) return;
            
            if (meal.done) {
                total += meal.calories || 0;
            } else if (meal.calories > (defaults[mealType] || 0)) {
                // Add substitution calories for uncompleted meals
                total += meal.calories - defaults[mealType];
            }
        });
        
        return total;
    },
    
    calculateStreak(data) {
        const dates = Object.keys(data.logs || {}).sort().reverse();
        let streak = 0;
        
        for (const date of dates) {
            const meals = data.logs[date]?.meals || {};
            const completed = Object.values(meals).filter(m => m?.done).length;
            if (completed >= 3) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    },
    
    calculateGoalProgress(data) {
        const { targetKg, targetWeeks, maintenanceCalories, fitnessGoal, cuttingIntensity } = data.userSettings;
        
        // Prevent division by zero
        if (!targetWeeks || targetWeeks === 0) {
            return {
                targetDaily: maintenanceCalories || 2400,
                dailySurplusRequired: 0,
                avgActual: 0,
                progress: '0.0',
                clampedProgress: 0
            };
        }
        
        let dailySurplusRequired = ((targetKg || 0) * 7700) / (targetWeeks * 7);
        
        // Adjust for cutting goals
        if (fitnessGoal === 'cut') {
            dailySurplusRequired = -dailySurplusRequired;
        }
        
        const targetDaily = (maintenanceCalories || 2400) + dailySurplusRequired;
        
        const dates = Object.keys(data.logs || {}).sort().slice(-7);
        const avgActual = dates.length > 0 
            ? dates.reduce((sum, date) => sum + this.calculateDailyCalories(data, date), 0) / dates.length 
            : 0;
        
        const actualSurplus = avgActual - (maintenanceCalories || 2400);
        const progress = dailySurplusRequired !== 0 ? (actualSurplus / dailySurplusRequired * 100) : 0;
        const clampedProgress = Math.min(Math.max(progress, 0), 100);
        
        return {
            targetDaily: Math.round(targetDaily),
            dailySurplusRequired: Math.round(dailySurplusRequired),
            avgActual: Math.round(avgActual),
            progress: progress.toFixed(1),
            clampedProgress
        };
    }
};