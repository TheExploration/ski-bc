import React, { useState, useEffect, useRef } from 'react';
import { skiResorts, getDisplayName } from '../utils/constants.js';

export function ControlPanel({
  selectedResorts,
  setSelectedResorts,
  selectedElevation,
  setSelectedElevation,
  selectedSort,
  setSelectedSort,
  selectedSortDay,
  setSelectedSortDay,
  moreInfo,
  setMoreInfo,
  isReversed,
  setIsReversed,
  searchTerm,
  setSearchTerm,
  filteredResorts,
  allWeatherData,
  processResortData,
  cancelLoading
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showElevationMenu, setShowElevationMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showSortDayMenu, setShowSortDayMenu] = useState(false);
  
  const searchInputRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-dropdown]')) {
        setShowDropdown(false);
        setShowElevationMenu(false);
        setShowSortMenu(false);
        setShowSortDayMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleResortToggle = (resortId) => {
    setSelectedResorts(prev => 
      prev.includes(resortId) 
        ? prev.filter(id => id !== resortId)
        : [...prev, resortId]
    );
  };

  const handleSelectAll = () => {
    const visibleResorts = filteredResorts;
    const allSelected = visibleResorts.every(resort => selectedResorts.includes(resort));
    
    if (allSelected) {
      // Deselect all visible resorts
      cancelLoading();
      setSelectedResorts(prev => prev.filter(resort => !visibleResorts.includes(resort)));
    } else {
      // Select all visible resorts
      setSelectedResorts(prev => {
        const newSelection = [...prev];
        visibleResorts.forEach(resort => {
          if (!newSelection.includes(resort)) {
            newSelection.push(resort);
          }
        });
        return newSelection;
      });
    }
  };

  const getSortDayOptions = () => {
    if (selectedResorts.length === 0 || !allWeatherData) return [];
    
    const firstResort = selectedResorts[0];
    const elevation = selectedElevation === 'bot' ? 'botData' : selectedElevation === 'mid' ? 'midData' : 'topData';
    const resortData = processResortData(allWeatherData, firstResort, elevation);
    
    return resortData?.days || [];
  };

  const isAllSelected = filteredResorts.length > 0 && filteredResorts.every(resort => selectedResorts.includes(resort));

  const elevationText = selectedElevation === 'bot' ? 'Base Forecast' : 
                       selectedElevation === 'mid' ? 'Mid Forecast' : 'Peak Forecast';

  const sortText = selectedSort === 'temperature' ? 'Sort by Temperature' :
                   selectedSort === 'snowfall' ? 'Sort by Snowfall' : 'Sort by Wind';

  const sortDayOptions = getSortDayOptions();
  const sortDayText = sortDayOptions[selectedSortDay]?.name || 'Today';

  return (
    <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Resort Selection Dropdown */}
        <div className="relative" data-dropdown>
          <button 
            onClick={() => {
              setShowDropdown(!showDropdown);
              setShowElevationMenu(false);
              setShowSortMenu(false);
              setShowSortDayMenu(false);
              if (!showDropdown && searchInputRef.current) {
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }
            }}
            className="w-full md:w-64 bg-white border border-gray-300 rounded-lg px-4 py-2 text-left flex items-center justify-between shadow-sm hover:bg-gray-50"
          >
            <span className="block truncate">Select Resorts</span>
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {showDropdown && (
            <div className="absolute z-10 mt-1 w-full md:w-64 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto">
              <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Search resorts..."
                    onClick={(e) => e.stopPropagation()}
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="p-2 space-y-1">
                <label className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isAllSelected} 
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium">
                    {isAllSelected ? 'Deselect All' : 'Select All'}
                  </span>
                </label>
                <div className="border-t border-gray-200 my-2"></div>
                {filteredResorts.map(resort => (
                  <label key={resort} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedResorts.includes(resort)}
                      onChange={() => handleResortToggle(resort)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm">{getDisplayName(resort)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Elevation Dropdown */}
        <div className="relative" data-dropdown>
          <button 
            onClick={() => {
              setShowElevationMenu(!showElevationMenu);
              setShowDropdown(false);
              setShowSortMenu(false);
              setShowSortDayMenu(false);
            }}
            className="w-full md:w-48 bg-white border border-gray-300 rounded-lg px-4 py-2 text-left flex items-center justify-between shadow-sm hover:bg-gray-50"
          >
            <span className="block truncate capitalize">{elevationText}</span>
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {showElevationMenu && (
            <div className="absolute right-0 z-10 mt-1 w-48 bg-white rounded-lg shadow-lg">
              <div className="p-2 space-y-1">
                <button 
                  onClick={() => {
                    setSelectedElevation('bot');
                    setShowElevationMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-lg"
                >
                  Base Forecast
                </button>
                <button 
                  onClick={() => {
                    setSelectedElevation('mid');
                    setShowElevationMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-lg"
                >
                  Mid Forecast
                </button>
                <button 
                  onClick={() => {
                    setSelectedElevation('top');
                    setShowElevationMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-lg"
                >
                  Peak Forecast
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Full View Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={moreInfo}
            onChange={(e) => setMoreInfo(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-bold text-gray-900">Full View</span>
        </label>
      </div>

      <div className="flex items-center gap-4">
        {/* Reverse Order Button */}
        <button
          onClick={() => setIsReversed(!isReversed)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-medium text-gray-700"
        >
          {isReversed ? '↑ Reverse Order' : '↓ Normal Order'}
        </button>

        {/* Sort Dropdown */}
        <div className="relative" data-dropdown>
          <button 
            onClick={() => {
              setShowSortMenu(!showSortMenu);
              setShowDropdown(false);
              setShowElevationMenu(false);
              setShowSortDayMenu(false);
            }}
            className="w-full md:w-48 bg-white border border-gray-300 rounded-lg px-4 py-2 text-left flex items-center justify-between shadow-sm hover:bg-gray-50"
          >
            <span className="block truncate capitalize">{sortText}</span>
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {showSortMenu && (
            <div className="absolute right-0 z-10 mt-1 w-48 bg-white rounded-lg shadow-lg">
              <div className="p-2 space-y-1">
                <button 
                  onClick={() => {
                    setSelectedSort('temperature');
                    setShowSortMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-lg"
                >
                  Sort by Temperature
                </button>
                <button 
                  onClick={() => {
                    setSelectedSort('snowfall');
                    setShowSortMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-lg"
                >
                  Sort by Snowfall
                </button>
                <button 
                  onClick={() => {
                    setSelectedSort('wind');
                    setShowSortMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-lg"
                >
                  Sort by Wind
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sort Day Dropdown */}
        <div className="relative" data-dropdown>
          <button 
            onClick={() => {
              setShowSortDayMenu(!showSortDayMenu);
              setShowDropdown(false);
              setShowElevationMenu(false);
              setShowSortMenu(false);
            }}
            className="w-full md:w-32 bg-white border border-gray-300 rounded-lg px-4 py-2 text-left flex items-center justify-between shadow-sm hover:bg-gray-50"
          >
            <span className="block truncate capitalize">{sortDayText}</span>
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {showSortDayMenu && (
            <div className="absolute right-0 z-10 mt-1 w-32 bg-white rounded-lg shadow-lg">
              <div className="p-2 space-y-1">
                {sortDayOptions.length > 0 ? 
                  sortDayOptions.map((day, index) => (
                    <button 
                      key={index}
                      onClick={() => {
                        setSelectedSortDay(index);
                        setShowSortDayMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-lg"
                    >
                      {day.name}
                    </button>
                  )) :
                  <div className="text-sm text-gray-500 px-4 py-2">Loading...</div>
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}