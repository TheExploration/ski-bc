import { useState, useEffect, useRef } from 'react';
import { fetchAllData } from '../utils/weather.js';

export function useWeatherData() {
  const [allWeatherData, setAllWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadingController = useRef(null);

  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAllData();
        setAllWeatherData(data);
      } catch (err) {
        console.error('Failed to fetch weather data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadWeatherData();
  }, []);

  const createLoadingController = () => {
    // Cancel any existing loading
    if (loadingController.current) {
      loadingController.current.abort();
    }
    // Create new loading controller
    loadingController.current = new AbortController();
    return loadingController.current;
  };

  const cancelLoading = () => {
    if (loadingController.current) {
      loadingController.current.abort();
    }
  };

  return {
    allWeatherData,
    loading,
    error,
    createLoadingController,
    cancelLoading
  };
}