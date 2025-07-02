// UI 組件類別
class Components {
    // 建立日曆組件
    static createCalendar(containerId, year, month, events = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        let calendarHTML = `
            <div class="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: var(--border-color);">
                <div class="calendar-header" style="background: var(--background-color); padding: 0.75rem; text-align: center; font-weight: 600;">日</div>
                <div class="calendar-header" style="background: var(--background-color); padding: 0.75rem; text-align: center; font-weight: 600;">一</div>
                <div class="calendar-header" style="background: var(--background-color); padding: 0.75rem; text-align: center; font-weight: 600;">二</div>
                <div class="calendar-header" style="background: var(--background-color); padding: 0.75rem; text-align: center; font-weight: 600;">三</div>
                <div class="calendar-header" style="background: var(--background-color); padding: 0.75rem; text-align: center; font-weight: 600;">四</div>
                <div class="calendar-header" style="background: var(--background-color); padding: 0.75rem; text-align: center; font-weight: 600;">五</div>
                <div class="calendar-header" style="background: var(--background-color); padding: 0.75rem; text-align: center; font-weight: 600;">六</div>
        `;
        
        // 空白日期
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarHTML += `<div class="calendar-day empty" style="background: var(--surface-color); min-height: 100px;"></div>`;
        }
        
        // 日期
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events[dateKey] || [];
            const isToday = this.isToday(year, month - 1, day);
            
            calendarHTML += `
                <div class="calendar-day ${isToday ? 'today' : ''}" 
                     style="background: var(--surface-color); min-height: 100px; padding: 0.5rem; border: ${isToday ? '2px solid var(--primary-color)' : 'none'};"
                     data-date="${dateKey}">
                    <div class="day-number" style="font-weight: 600; margin-bottom: 0.25rem;">${day}</div>
                    <div class="day-events">
                        ${dayEvents.slice(0, 3).map(event => `
                            <div class="event-item" style="background: var(--primary-color); color: white; font-size: 0.75rem; padding: 0.125rem 0.25rem; margin-bottom: 0.125rem; border-radius: 3px; cursor: pointer;" 
                                 title="${event.title}">
                                ${event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title}
                            </div>
                        `).join('')}
                        ${dayEvents.length > 3 ? `<div class="more-events" style="font-size: 0.75rem; color: var(--text-secondary);">+${dayEvents.length - 3} 更多</div>` : ''}
                    </div>
                </div>
            `;
        }
        
        calendarHTML += '</div>';
        container.innerHTML = calendarHTML;
        
        // 添加點擊事件
        container.addEventListener('click', (e) => {
            const dayElement = e.target.closest('.calendar-day');
            if (dayElement && dayElement.dataset.date) {
                this.onDateClick(dayElement.dataset.date, events[dayElement.dataset.date] || []);
            }
        });
    }
    
    static isToday(year, month, day) {
        const today = new Date();
        return today.getFullYear() === year && 
               today.getMonth() === month && 
               today.getDate() === day;
    }
    
    static onDateClick(date, events) {
        if (events.length === 0) return;
        
        const content = `
            <div class="date-events">
                <h4 class="mb-3">${date} 的項目</h4>
                <div class="events-list">
                    ${events.map(event => `
                        <div class="event-detail card mb-2">
                            <div class="card-body p-3">
                                <h5 class="mb-2">${event.title}</h5>
                                <p class="text-secondary mb-2">${event.content || ''}</p>
                                <div class="event-meta">
                                    <span class="badge bg-primary">${event.tag || ''}</span>
                                    <span class="badge ${event.status === '已完成' || event.status === '已發佈' ? 'bg-success' : 'bg-warning'}">${event.status || ''}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        app.showModal(`${date} 的項目`, content);
    }
    
    // 建立甘特圖組件
    static createGanttChart(containerId, items = []) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (items.length === 0) {
            container.innerHTML = '<p class="text-center text-secondary">暫無資料</p>';
            return;
        }
        
        // 計算時間範圍
        const dates = items.flatMap(item => [new Date(item.start_time), new Date(item.end_time)]);
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        
        // 生成日期標題
        const dateHeaders = [];
        const currentDate = new Date(minDate);
        while (currentDate <= maxDate) {
            dateHeaders.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        let ganttHTML = `
            <div class="gantt-chart">
                <div class="gantt-header" style="display: grid; grid-template-columns: 300px repeat(${dateHeaders.length}, 60px); gap: 1px; background: var(--border-color);">
                    <div class="gantt-title-header" style="background: var(--background-color); padding: 0.75rem; font-weight: 600;">項目</div>
                    ${dateHeaders.map(date => `
                        <div class="gantt-date-header" style="background: var(--background-color); padding: 0.75rem; text-align: center; font-size: 0.75rem;">
                            ${date.getMonth() + 1}/${date.getDate()}
                        </div>
                    `).join('')}
                </div>
                <div class="gantt-body">
                    ${items.map(item => {
                        const startDate = new Date(item.start_time);
                        const endDate = new Date(item.end_time);
                        const startIndex = Math.floor((startDate - minDate) / (24 * 60 * 60 * 1000));
                        const duration = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000)) + 1;
                        
                        return `
                            <div class="gantt-row" style="display: grid; grid-template-columns: 300px repeat(${dateHeaders.length}, 60px); gap: 1px; background: var(--border-color); margin-bottom: 1px;">
                                <div class="gantt-item-info" style="background: var(--surface-color); padding: 0.75rem;">
                                    <div class="item-title" style="font-weight: 500; margin-bottom: 0.25rem;">${item.title}</div>
                                    <div class="item-meta" style="font-size: 0.75rem; color: var(--text-secondary);">
                                        <span class="badge bg-primary">${item.tag}</span>
                                        <span class="badge ${item.status === '已完成' ? 'bg-success' : 'bg-warning'}">${item.status}</span>
                                    </div>
                                </div>
                                ${dateHeaders.map((date, index) => {
                                    const isInRange = index >= startIndex && index < startIndex + duration;
                                    const isStart = index === startIndex;
                                    const isEnd = index === startIndex + duration - 1;
                                    
                                    return `
                                        <div class="gantt-cell" style="background: var(--surface-color); min-height: 60px; position: relative;">
                                            ${isInRange ? `
                                                <div class="gantt-bar" style="
                                                    background: var(--primary-color); 
                                                    height: 20px; 
                                                    margin: 20px 2px;
                                                    border-radius: ${isStart ? '4px 0 0 4px' : isEnd ? '0 4px 4px 0' : '0'};
                                                    ${isStart ? `position: relative;` : ''}
                                                ">
                                                    ${isStart ? `<span style="position: absolute; left: 4px; top: 2px; font-size: 0.75rem; color: white; white-space: nowrap;">${item.title}</span>` : ''}
                                                </div>
                                            ` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        container.innerHTML = ganttHTML;
    }
    
    // 建立統計卡片
    static createStatCard(title, value, icon, color = 'primary') {
        return `
            <div class="stat-card card">
                <div class="card-body">
                    <div class="d-flex justify-between items-center">
                        <div>
                            <h3 class="text-secondary mb-2">${title}</h3>
                            <p class="text-3xl font-bold text-${color}">${value}</p>
                        </div>
                        <div class="stat-icon">
                            <i class="${icon} text-${color}" style="font-size: 2rem;"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 建立表格
    static createTable(headers, rows, actions = []) {
        const actionsHeader = actions.length > 0 ? '<th>操作</th>' : '';
        const headersHTML = headers.map(header => `<th>${header}</th>`).join('');
        
        const rowsHTML = rows.map(row => {
            const cellsHTML = row.map(cell => `<td>${cell}</td>`).join('');
            const actionsHTML = actions.length > 0 ? `
                <td>
                    ${actions.map(action => `
                        <button class="btn btn-sm ${action.class}" onclick="${action.onclick}">
                            <i class="${action.icon}"></i>
                        </button>
                    `).join('')}
                </td>
            ` : '';
            
            return `<tr>${cellsHTML}${actionsHTML}</tr>`;
        }).join('');
        
        return `
            <table class="table">
                <thead>
                    <tr>${headersHTML}${actionsHeader}</tr>
                </thead>
                <tbody>
                    ${rowsHTML}
                </tbody>
            </table>
        `;
    }
    
    // 建立分頁組件
    static createPagination(currentPage, totalPages, onPageChange) {
        if (totalPages <= 1) return '';
        
        const pages = [];
        const maxVisible = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        
        return `
            <div class="pagination d-flex justify-center items-center gap-2 mt-4">
                <button class="btn btn-outline" ${currentPage === 1 ? 'disabled' : ''} onclick="${onPageChange}(${currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                ${startPage > 1 ? `
                    <button class="btn btn-outline" onclick="${onPageChange}(1)">1</button>
                    ${startPage > 2 ? '<span>...</span>' : ''}
                ` : ''}
                
                ${pages.map(page => `
                    <button class="btn ${page === currentPage ? 'btn-primary' : 'btn-outline'}" onclick="${onPageChange}(${page})">
                        ${page}
                    </button>
                `).join('')}
                
                ${endPage < totalPages ? `
                    ${endPage < totalPages - 1 ? '<span>...</span>' : ''}
                    <button class="btn btn-outline" onclick="${onPageChange}(${totalPages})">${totalPages}</button>
                ` : ''}
                
                <button class="btn btn-outline" ${currentPage === totalPages ? 'disabled' : ''} onclick="${onPageChange}(${currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    }
    
    // 建立篩選器組件
    static createFilters(filters) {
        return `
            <div class="filters d-flex gap-2 mb-4">
                ${filters.map(filter => {
                    if (filter.type === 'select') {
                        return `
                            <select class="form-input form-select" style="width: auto;" onchange="${filter.onChange}(this.value)">
                                <option value="">${filter.placeholder}</option>
                                ${filter.options.map(option => `
                                    <option value="${option.value}">${option.label}</option>
                                `).join('')}
                            </select>
                        `;
                    } else if (filter.type === 'search') {
                        return `
                            <input type="text" class="form-input" placeholder="${filter.placeholder}" 
                                   style="width: 200px;" oninput="${filter.onChange}(this.value)">
                        `;
                    }
                    return '';
                }).join('')}
            </div>
        `;
    }
    
    // 建立徽章組件
    static createBadge(text, type = 'primary') {
        const colors = {
            primary: 'bg-primary',
            success: 'bg-success',
            warning: 'bg-warning',
            error: 'bg-error',
            secondary: 'bg-secondary'
        };
        
        return `<span class="badge ${colors[type] || colors.primary}">${text}</span>`;
    }
    
    // 建立載入狀態
    static createLoadingState(message = '載入中...') {
        return `
            <div class="loading-state text-center p-4">
                <i class="fas fa-spinner fa-spin mb-2" style="font-size: 2rem; color: var(--primary-color);"></i>
                <p class="text-secondary">${message}</p>
            </div>
        `;
    }
    
    // 建立空狀態
    static createEmptyState(message = '暫無資料', icon = 'fas fa-inbox') {
        return `
            <div class="empty-state text-center p-6">
                <i class="${icon} mb-3" style="font-size: 3rem; color: var(--text-secondary);"></i>
                <p class="text-secondary">${message}</p>
            </div>
        `;
    }
}

