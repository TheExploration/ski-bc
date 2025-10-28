import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.jsx';
import { ControlPanel } from './components/ControlPanel.jsx';
import { ResortCard } from './components/ResortCard.jsx';
import { DefaultCard } from './components/DefaultCard.jsx';
import SplashCursor from './components/ui/splash-cursor.jsx';
import { useWeatherData } from './hooks/useWeatherData.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { useResortFiltering } from './hooks/useResortFiltering.js';
import { processResortData } from './utils/weather.js';
import { 
  skiResorts, 
  defaultSelectedResorts, 
  defaultElevation, 
  defaultSort, 
  defaultSortDay,
  getDisplayName 
} from './utils/constants.js';

function App() {
  // Weather data hook
  const { allWeatherData, loading, error, createLoadingController, cancelLoading } = useWeatherData();
  
  // Local storage state
  const [selectedResorts, setSelectedResorts] = useLocalStorage('selectedResorts', defaultSelectedResorts);
  const [selectedElevation, setSelectedElevation] = useLocalStorage('selectedElevation', defaultElevation);
  const [selectedSort, setSelectedSort] = useLocalStorage('selectedSort', defaultSort);
  const [selectedSortDay, setSelectedSortDay] = useLocalStorage('selectedSortDay', defaultSortDay);
  const [isReversed, setIsReversed] = useLocalStorage('reverseOrder', false);
  
  // Local component state
  const [moreInfo, setMoreInfo] = useState(false);
  const [resortData, setResortData] = useState(new Map());
  const [isMouseDown, setIsMouseDown] = useState(false);
  
  // Resort filtering hook
  const { searchTerm, setSearchTerm, filteredResorts, sortResorts } = useResortFiltering(skiResorts, allWeatherData);

  // Load resort data
  const loadResort = useCallback(async (resortName) => {
    if (!allWeatherData) return false;
    
    try {
      const elevation = selectedElevation === 'bot' ? 'botData' : selectedElevation === 'mid' ? 'midData' : 'topData';
      const data = processResortData(allWeatherData, resortName, elevation);
      
      if (data) {
        data.name = getDisplayName(resortName);
        setResortData(prev => new Map(prev.set(resortName, data)));
      }
      return true;
    } catch (err) {
      console.warn(`Failed to load ${resortName}:`, err);
      return false;
    }
  }, [allWeatherData, selectedElevation]);

  // Load all selected resorts
  const loadSelectedResorts = useCallback(async () => {
    if (!allWeatherData || selectedResorts.length === 0) {
      setResortData(new Map());
      return;
    }

    // Create new loading controller
    const controller = createLoadingController();
    
    try {
      // Sort resorts
      const sortedResorts = sortResorts(
        selectedResorts, 
        selectedSort, 
        selectedElevation, 
        selectedSortDay, 
        isReversed
      );

      // Clear existing data
      setResortData(new Map());

      // Load resorts in parallel
      await Promise.all(
        sortedResorts.map(resort => {
          if (controller.signal.aborted) return Promise.resolve(false);
          return loadResort(resort);
        })
      );
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error('Error loading resorts:', error);
      }
    }
  }, [
    allWeatherData, 
    selectedResorts, 
    selectedSort, 
    selectedElevation, 
    selectedSortDay, 
    isReversed, 
    sortResorts, 
    loadResort, 
    createLoadingController
  ]);

  // Load resorts when dependencies change
  useEffect(() => {
    loadSelectedResorts();
  }, [loadSelectedResorts]);

  // Mouse down/up event handlers for splash cursor
  useEffect(() => {
    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = () => setIsMouseDown(false); // Reset when mouse leaves window

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Handle resort selection changes
  const handleResortsChange = useCallback((newResorts) => {
    setSelectedResorts(newResorts);
  }, [setSelectedResorts]);

  // Handle elevation changes
  const handleElevationChange = useCallback((newElevation) => {
    setSelectedElevation(newElevation);
  }, [setSelectedElevation]);

  // Handle sort changes
  const handleSortChange = useCallback((newSort) => {
    setSelectedSort(newSort);
  }, [setSelectedSort]);

  // Handle sort day changes
  const handleSortDayChange = useCallback((newSortDay) => {
    setSelectedSortDay(newSortDay);
  }, [setSelectedSortDay]);

  // Handle reverse order changes
  const handleReverseChange = useCallback((newReversed) => {
    setIsReversed(newReversed);
  }, [setIsReversed]);

  // Get sorted resort data for display
  const displayResorts = React.useMemo(() => {
    if (!allWeatherData || selectedResorts.length === 0) return [];
    
    const sortedResorts = sortResorts(
      selectedResorts, 
      selectedSort, 
      selectedElevation, 
      selectedSortDay, 
      isReversed
    );

    return sortedResorts
      .map(resortId => resortData.get(resortId))
      .filter(Boolean);
  }, [
    allWeatherData,
    selectedResorts,
    selectedSort,
    selectedElevation,
    selectedSortDay,
    isReversed,
    resortData,
    sortResorts
  ]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-600">Loading weather data...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-red-600">Error loading weather data</div>
          <div className="text-sm text-gray-600 mt-2">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <SplashCursor enabled={isMouseDown} />
      <Header />
      
      <div className="max-w-7xl mx-auto">
        <ControlPanel
          selectedResorts={selectedResorts}
          setSelectedResorts={handleResortsChange}
          selectedElevation={selectedElevation}
          setSelectedElevation={handleElevationChange}
          selectedSort={selectedSort}
          setSelectedSort={handleSortChange}
          selectedSortDay={selectedSortDay}
          setSelectedSortDay={handleSortDayChange}
          moreInfo={moreInfo}
          setMoreInfo={setMoreInfo}
          isReversed={isReversed}
          setIsReversed={handleReverseChange}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredResorts={filteredResorts}
          allWeatherData={allWeatherData}
          processResortData={processResortData}
          cancelLoading={cancelLoading}
        />
        
        <div className="space-y-8">
          {displayResorts.map((resort, index) => (
            <div key={`${resort.name}-${index}`}>
              {moreInfo ? (
                <ResortCard resort={resort} />
              ) : (
                <DefaultCard resort={resort} />
              )}
            </div>
          ))}
          
          {selectedResorts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Select resorts to view forecasts</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;