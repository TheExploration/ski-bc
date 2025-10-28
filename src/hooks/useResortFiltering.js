import { useState, useMemo } from 'react';
import { processResortData } from '../utils/weather.js';

export function useResortFiltering(skiResorts, allWeatherData) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResorts = useMemo(() => {
    if (!searchTerm) return skiResorts;
    
    const normalizedSearch = searchTerm.toLowerCase();
    return skiResorts.filter(resort => {
      const displayName = resort.replace(/-/g, ' ').toLowerCase();
      return displayName.includes(normalizedSearch);
    });
  }, [skiResorts, searchTerm]);

  const sortResorts = (resorts, sortBy, selectedElevation, selectedSortDay, isReversed) => {
    if (!allWeatherData) return resorts;

    const elevation = selectedElevation === 'bot' ? 'botData' : selectedElevation === 'mid' ? 'midData' : 'topData';
    
    let sortedResorts = [...resorts].sort((a, b) => {
      const resortDataA = processResortData(allWeatherData, a, elevation);
      const resortDataB = processResortData(allWeatherData, b, elevation);
      
      if (!resortDataA || !resortDataB) return 0;

      const dayA = resortDataA.days[selectedSortDay];
      const dayB = resortDataB.days[selectedSortDay];

      if (!dayA || !dayB) return 0;

      const getMaxTemp = (day) => {
        return Math.max(
          ...day.periods.map(period => {
            const temp = parseFloat(period.temp);
            return isNaN(temp) ? -Infinity : temp;
          })
        );
      };

      const getTotalSnow = (day) => {
        return day.periods.reduce((sum, period) => {
          const snow = parseFloat(period.snow) || 0;
          return sum + snow;
        }, 0);
      };

      const getPMWind = (day) => {
        const pmPeriod = day.periods.find(p => p.time === 'PM');
        const nightPeriod = day.periods.find(p => p.time === 'Night');
        
        return pmPeriod !== undefined 
          ? parseFloat(pmPeriod.wind) 
          : (nightPeriod !== undefined ? parseFloat(nightPeriod.wind) : 0);
      };

      switch (sortBy) {
        case 'temperature':
          return getMaxTemp(dayA) - getMaxTemp(dayB);
        case 'snowfall':
          return getTotalSnow(dayB) - getTotalSnow(dayA);
        case 'wind':
          return getPMWind(dayB) - getPMWind(dayA);
        default:
          return 0;
      }
    });

    // Apply reverse order if enabled
    if (isReversed) {
      sortedResorts = sortedResorts.reverse();
    }

    return sortedResorts;
  };

  return {
    searchTerm,
    setSearchTerm,
    filteredResorts,
    sortResorts
  };
}