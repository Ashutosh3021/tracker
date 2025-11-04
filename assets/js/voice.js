// Voice module
export const Voice = {
    startVoiceRecognition(callback) {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;
        
        const btn = document.getElementById('voice-btn');
        if (btn) {
            btn.classList.add('listening');
        }
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log('Voice recognized:', transcript);
            callback(transcript);
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (btn) {
                btn.classList.remove('listening');
            }
            
            let errorMessage = '';
            switch(event.error) {
                case 'not-allowed':
                case 'service-not-allowed':
                    errorMessage = 'Microphone access denied. Please enable microphone permissions in your browser settings.';
                    break;
                case 'no-speech':
                    errorMessage = 'No speech detected. Please try again and speak clearly.';
                    break;
                case 'network':
                    errorMessage = 'Network error. Please check your internet connection.';
                    break;
                case 'aborted':
                    return; // Don't show error for aborted (user stopped)
                default:
                    errorMessage = `Voice recognition error: ${event.error}. Please try again.`;
            }
            
            if (errorMessage) {
                alert(errorMessage);
            }
        };
        
        recognition.onend = () => {
            if (btn) {
                btn.classList.remove('listening');
            }
        };
        
        try {
            recognition.start();
        } catch (e) {
            console.error('Failed to start recognition:', e);
            if (btn) {
                btn.classList.remove('listening');
            }
            alert('Failed to start voice recognition. The microphone may be in use by another application.');
        }
    },
    
    handleVoiceCommand(command, app) {
        console.log('Processing voice command:', command);
        
        const commands = {
            breakfast: () => {
                const meal = app.data.logs[app.currentDate]?.meals?.breakfast;
                if (meal && !meal.done) {
                    app.toggleMeal('breakfast');
                    alert('✓ Breakfast marked as done!');
                } else {
                    alert('Breakfast is already marked as done.');
                }
            },
            lunch: () => {
                const meal = app.data.logs[app.currentDate]?.meals?.lunch;
                if (meal && !meal.done) {
                    app.toggleMeal('lunch');
                    alert('✓ Lunch marked as done!');
                } else {
                    alert('Lunch is already marked as done.');
                }
            },
            dinner: () => {
                const meal = app.data.logs[app.currentDate]?.meals?.dinner;
                if (meal && !meal.done) {
                    app.toggleMeal('dinner');
                    alert('✓ Dinner marked as done!');
                } else {
                    alert('Dinner is already marked as done.');
                }
            },
            snack: () => {
                const meal = app.data.logs[app.currentDate]?.meals?.snacks;
                if (meal && !meal.done) {
                    app.toggleMeal('snacks');
                    alert('✓ Snacks marked as done!');
                } else {
                    alert('Snacks are already marked as done.');
                }
            },
            export: () => {
                app.exportData();
                alert('✓ Data exported successfully!');
            },
            backup: () => {
                app.exportData();
                alert('✓ Backup created successfully!');
            },
            stats: () => {
                app.switchSection('stats');
                alert('Showing statistics');
            },
            statistics: () => {
                app.switchSection('stats');
                alert('Showing statistics');
            }
        };
        
        // Try to match command
        let matched = false;
        for (const [key, action] of Object.entries(commands)) {
            if (command.includes(key)) {
                action();
                matched = true;
                break;
            }
        }
        
        if (!matched) {
            alert('Command not recognized. Try saying:\n• "mark breakfast done"\n• "mark lunch done"\n• "export data"\n• "show stats"');
        }
    }
};