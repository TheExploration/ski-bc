export function createDefaultCard(resort) {
  return `
    <div class="resort-card rounded-2xl p-4 shadow-lg mb-6 backdrop-blur-md bg-white/80">
      <div class="mb-3">
        <h2 class="text-xl font-semibold text-text-primary tracking-tight">${resort.name}</h2>
        <p class="text-xs text-text-secondary">${resort.elevation}</p>
      </div>
      <div class="relative">
        <button 
          onclick="this.parentElement.querySelector('.scroll-container').scrollBy({left: -200, behavior: 'smooth'})"
          class="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 bg-white/80 rounded-full p-2 shadow-lg hover:bg-white/90 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button 
          onclick="this.parentElement.querySelector('.scroll-container').scrollBy({left: 200, behavior: 'smooth'})"
          class="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 bg-white/80 rounded-full p-2 shadow-lg hover:bg-white/90 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
        <div class="scroll-container overflow-x-auto hide-scrollbar">
          <div class="flex gap-3 pb-2" style="width: max-content">
            ${resort.days.map(day => {
              const dayStats = calculateDayStats(day);
              const weatherText = formatWeatherText(day.periods);
              return `
                <div class="w-[180px]">
                  <div class="flex items-center gap-1 mb-1">
                    <h3 class="text-sm font-semibold text-text-primary tracking-tight">${day.name}</h3>
                    <span class="text-lg">${day.weatherEmoji}</span>
                  </div>
                  <div class="bg-snow-blue rounded-xl p-3 backdrop-blur-sm">
                    <div class="flex items-center gap-2">
                      <div class="text-2xl font-bold ${getTemperatureClass(dayStats.maxTemp)}">${dayStats.maxTemp}°C</div>
                      ${dayStats.snow > 0 ? `
                        <div class="text-sm font-bold ${dayStats.snow >= 20 ? 'rainbow-text' : (dayStats.snow >= 10 ? 'apple-rainbow-text' : 'text-text-blue')}">
                          ${dayStats.snow} cm snow
                        </div>
                      ` : ''}
                    </div>
                    <div class="text-sm text-text-primary mt-1 font-medium truncate" title="${weatherText}">${weatherText}</div>
                    <div class="text-xs font-medium ${dayStats.wind > 20 ? 'text-text-blue' : 'text-text-secondary'} mt-1">
                      ${dayStats.wind} km/h wind
                    </div>
                    <div class="mt-2 pt-2 border-t border-black/5">
                      <div class="text-xs text-text-primary font-medium">
                        Freezing: ${day.freezingLevel}
                      </div>
                      <div class="text-xs font-medium mt-0.5 truncate ${day.snowCondition.isRainbow ? 'apple-rainbow-text' : 'text-text-blue'}" title="${day.snowCondition.text}">
                        ${day.snowCondition.text}
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function formatWeatherText(periods) {
  if (!periods || periods.length === 0) return 'No data';

  const amPeriod = periods.find(p => p.time === 'AM');
  const pmPeriod = periods.find(p => p.time === 'PM');

  if (amPeriod && pmPeriod) {
    // If AM and PM conditions are the same, show just one
    if (amPeriod.condition === pmPeriod.condition) {
      return amPeriod.condition;
    }
    return `${amPeriod.condition} / ${pmPeriod.condition}`;
  } else if (pmPeriod) {
    return pmPeriod.condition;
  } else if (periods.length === 1) {
    return periods[0].condition;
  }

  return periods[0].condition;
}

function calculateDayStats(day) {
  const periods = day.periods;
  if (!periods.length) return { maxTemp: 0, snow: 0, wind: 0 };

  let maxTemp = -Infinity;
  let totalSnow = 0;
  
  // Get PM wind or fallback to available wind
  let wind = 0;
  const pmPeriod = periods.find(p => p.time === 'PM');
  if (pmPeriod) {
    wind = parseFloat(pmPeriod.wind.replace(' km/h', '')) || 0;
  } else if (periods.length > 0) {
    // If no PM period, take the first available wind value
    wind = parseFloat(periods[0].wind.replace(' km/h', '')) || 0;
  }

  periods.forEach(period => {
    // Temperature - find maximum
    const temp = parseFloat(period.temp.replace('°C', '')) || 0;
    maxTemp = Math.max(maxTemp, temp);

    // Snow - accumulate
    const snowAmount = parseFloat(period.snow.replace(' cm', '')) || 0;
    totalSnow += snowAmount;
  });

  return {
    maxTemp: Math.round(maxTemp * 10) / 10,
    snow: Math.round(totalSnow * 10) / 10,
    wind: Math.round(wind)
  };
}

function getTemperatureClass(temp) {
  const temperature = parseFloat(temp);
  if (temperature <= 0) return 'text-blue-600 font-semibold';
  if (temperature <= 5) return 'text-green-600 font-semibold';
  if (temperature <= 10) return 'text-orange-500 font-semibold';
  return 'text-red-500 font-semibold';
}