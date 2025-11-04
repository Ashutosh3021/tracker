// UI module
export const UI = {
    renderMeals(data, currentDate) {
        const meals = [
            { 
                id: 'breakfast', 
                name: 'Breakfast',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>'
            },
            { 
                id: 'lunch', 
                name: 'Lunch',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
            },
            { 
                id: 'dinner', 
                name: 'Dinner',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'
            },
            { 
                id: 'snacks', 
                name: 'Snacks',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>'
            }
        ];
        
        const container = document.getElementById('meals-list');
        if (!container) return;
        
        const log = data.logs[currentDate];
        if (!log || !log.meals) return;
        
        container.innerHTML = meals.map(meal => {
            const mealData = log.meals[meal.id];
            if (!mealData) return '';
            
            return `
                <div class="meal-item ${mealData.done ? 'checked' : ''}" data-meal="${meal.id}">
                    <div class="meal-left">
                        <div class="checkbox">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </div>
                        <div class="meal-icon">
                            ${meal.icon}
                        </div>
                        <div class="meal-info">
                            <h3>${meal.name}</h3>
                            <p>${mealData.done ? 'Completed' : 'Not completed'}</p>
                        </div>
                    </div>
                    <div class="meal-calories">
                        ${mealData.calories}
                        <span>kcal</span>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    renderHydration(data, currentDate) {
        const container = document.getElementById('hydration-cups');
        if (!container) return;
        
        const log = data.logs[currentDate];
        const filled = log?.waterCups || 0;
        const hydrationGoal = data.userSettings.hydrationGoal || 8;
        
        container.innerHTML = Array.from({length: hydrationGoal}, (_, i) => `
            <div class="cup ${i < filled ? 'filled' : ''}" data-cup="${i}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
            </div>
        `).join('');
        
        // Update card title
        const hydrationCard = container.closest('.card');
        if (hydrationCard) {
            const cardTitle = hydrationCard.querySelector('.card-header h2.card-title');
            if (cardTitle) {
                cardTitle.textContent = `Hydration (${hydrationGoal} cups)`;
            }
        }
    },
    
    renderMood(data, currentDate) {
        const moods = [
            { value: 1, label: 'Sad', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>' },
            { value: 2, label: 'Down', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>' },
            { value: 3, label: 'Okay', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>' },
            { value: 4, label: 'Good', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>' },
            { value: 5, label: 'Great', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 3 4 3 4-3 4-3"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>' }
        ];
        
        const container = document.getElementById('mood-slider');
        if (!container) return;
        
        const log = data.logs[currentDate];
        const selected = log?.mood || 0;
        
        container.innerHTML = moods.map(mood => `
            <div class="mood-option ${mood.value === selected ? 'selected' : ''}" data-mood="${mood.value}">
                ${mood.icon}
                <span>${mood.label}</span>
            </div>
        `).join('');
    },
    
    renderBadges(data, currentDate) {
        const badges = [
            { 
                id: 'first-day', 
                name: 'First Day', 
                desc: 'Log your first day',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
                check: () => Object.keys(data.logs || {}).length >= 1 
            },
            { 
                id: 'week-streak', 
                name: 'Week Warrior', 
                desc: '7 day streak',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
                check: () => this.calculateStreak(data) >= 7 
            },
            { 
                id: 'hydrated', 
                name: 'Hydrated', 
                desc: 'Reach daily hydration goal',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
                check: () => {
                    const log = data.logs[currentDate];
                    const goal = data.userSettings.hydrationGoal || 8;
                    return log && log.waterCups >= goal;
                }
            },
            { 
                id: 'early-bird', 
                name: 'Well Rested', 
                desc: '7+ hours of sleep',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
                check: () => {
                    const log = data.logs[currentDate];
                    return log && log.sleep && log.sleep.hours >= 7;
                }
            },
            { 
                id: 'consistent', 
                name: 'Consistency King', 
                desc: '30 days logged',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
                check: () => Object.keys(data.logs || {}).length >= 30 
            },
            { 
                id: 'perfect-day', 
                name: 'Perfect Day', 
                desc: 'All meals + hydration goal',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
                check: () => {
                    const log = data.logs[currentDate];
                    if (!log || !log.meals) return false;
                    
                    const allMeals = Object.values(log.meals).every(m => m && m.done);
                    const goal = data.userSettings.hydrationGoal || 8;
                    return allMeals && log.waterCups >= goal;
                }
            }
        ];
        
        const grid = document.getElementById('badges-grid');
        if (!grid) return badges;
        
        grid.innerHTML = badges.map(badge => {
            const unlocked = badge.check();
            
            return `
                <div class="badge ${unlocked ? 'unlocked' : ''}">
                    <div class="badge-icon">
                        ${badge.icon}
                    </div>
                    <div class="badge-name">${badge.name}</div>
                    <div class="badge-desc">${badge.desc}</div>
                </div>
            `;
        }).join('');
        
        return badges;
    },
    
    calculateStreak(data) {
        const dates = Object.keys(data.logs || {}).sort().reverse();
        let streak = 0;
        
        for (const date of dates) {
            const meals = data.logs[date]?.meals || {};
            const completed = Object.values(meals).filter(m => m && m.done).length;
            if (completed >= 3) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    },
    
    showSubstitutionModal(mealId, callback) {
        const modal = document.getElementById('substitution-modal');
        if (!modal) return;
        
        const mealNames = {
            breakfast: 'Breakfast',
            lunch: 'Lunch',
            dinner: 'Dinner',
            snacks: 'Snacks'
        };
        
        const textEl = document.getElementById('substitution-text');
        if (textEl) {
            textEl.textContent = `You unmarked ${mealNames[mealId]}. Would you like to add substitution calories to another meal?`;
        }
        
        // Build options excluding the current meal
        const allOptions = [
            { label: 'Add +150 cal to Snacks', calories: 150, target: 'snacks' },
            { label: 'Add +250 cal to Lunch', calories: 250, target: 'lunch' },
            { label: 'Add +400 cal to Dinner', calories: 400, target: 'dinner' },
        ];
        
        const options = allOptions.filter(opt => opt.target !== mealId);
        
        const optionsContainer = document.getElementById('substitution-options');
        if (!optionsContainer) return;
        
        // Clear existing content and event listeners by replacing the element
        const newOptionsContainer = optionsContainer.cloneNode(false);
        optionsContainer.parentNode.replaceChild(newOptionsContainer, optionsContainer);
        
        newOptionsContainer.innerHTML = options.map(opt => 
            `<button class="btn btn-secondary" data-action="substitution" data-target="${opt.target}" data-calories="${opt.calories}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                ${opt.label}
            </button>`
        ).join('') + `
            <button class="btn btn-secondary" data-action="close-modal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Skip
            </button>
        `;
        
        // Add event listeners
        newOptionsContainer.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                if (action === 'substitution') {
                    const target = e.currentTarget.dataset.target;
                    const calories = parseInt(e.currentTarget.dataset.calories);
                    callback(target, calories);
                    this.closeModal();
                } else if (action === 'close-modal') {
                    this.closeModal();
                }
            }, { once: true }); // Use once: true to auto-remove listener
        });
        
        modal.classList.add('active');
    },
    
    closeModal() {
        const modal = document.getElementById('substitution-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    showConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        const particles = Array.from({length: 80}, () => ({
            x: Math.random() * canvas.width,
            y: -20,
            vx: (Math.random() - 0.5) * 6,
            vy: Math.random() * 4 + 3,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 4
        }));
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.15;
                p.rotation += p.rotationSpeed;
                
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
                
                if (p.y > canvas.height) particles.splice(i, 1);
            });
            
            if (particles.length > 0) requestAnimationFrame(animate);
        };
        
        animate();
        
        // Vibrate if supported
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    }
};