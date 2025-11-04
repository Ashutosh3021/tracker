// Charts module
export const Charts = {
    drawChart(ctx, canvas, data, labels, type) {
        // Set canvas dimensions for retina displays
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = 600;
        canvas.style.width = canvas.offsetWidth + 'px';
        canvas.style.height = '300px';
        
        ctx.clearRect(0, 0, width, height);
        
        const padding = 80;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        // Get colors from CSS variables
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
        const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
        
        // Filter out invalid data for weight chart
        let filteredData = data;
        let filteredLabels = labels;
        
        if (type === 'weight') {
            const validIndices = data
                .map((value, index) => (value && value > 0) ? index : -1)
                .filter(index => index !== -1);
            filteredData = validIndices.map(index => data[index]);
            filteredLabels = validIndices.map(index => labels[index]);
        }
        
        // Draw axes
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // If no valid data, show message
        if (filteredData.length === 0) {
            ctx.fillStyle = textColor;
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('No data available', width / 2, height / 2);
            return;
        }
        
        // Calculate range
        const max = Math.max(...filteredData, 1);
        const min = Math.min(...filteredData);
        const range = max - min || 1;
        
        // Draw grid lines
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        
        // Draw data line (only if we have more than 1 point)
        if (filteredData.length > 1) {
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            filteredData.forEach((value, i) => {
                const x = padding + (chartWidth / (filteredData.length - 1)) * i;
                const y = height - padding - ((value - min) / range) * chartHeight;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
        }
        
        // Draw data points
        ctx.fillStyle = accentColor;
        filteredData.forEach((value, i) => {
            const x = padding + (chartWidth / Math.max(filteredData.length - 1, 1)) * i;
            const y = height - padding - ((value - min) / range) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw white center
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = accentColor;
        });
        
        // Draw X-axis labels
        ctx.fillStyle = textColor;
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        const labelStep = Math.max(1, Math.ceil(filteredLabels.length / 6));
        filteredLabels.forEach((label, i) => {
            if (i % labelStep === 0 || i === filteredLabels.length - 1) {
                const x = padding + (chartWidth / Math.max(filteredData.length - 1, 1)) * i;
                const shortLabel = label.slice(5); // MM-DD format
                ctx.fillText(shortLabel, x, height - padding + 15);
            }
        });
        
        // Draw Y-axis labels
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0; i <= 5; i++) {
            const value = min + (range / 5) * (5 - i);
            const y = padding + (chartHeight / 5) * i;
            const formattedValue = type === 'weight' ? value.toFixed(1) : Math.round(value);
            ctx.fillText(formattedValue, padding - 15, y);
        }
    }
};