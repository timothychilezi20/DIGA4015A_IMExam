import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for managing state with localStorage persistence
 * @param {string} key == The localStorage key
 * @param {any} initialValue == The initial value if nothing exists in localStorage
 * @param {object} options == Configuration options
 * @returns {[any, function, function]} == [storedValue, setValue, removeValue]
 */
function useLocalStorage(key, initialValue, options = {}) {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    syncAcrossTabs = true,
  } = options;

  // Get stored value from localStorage or use initial value
  const getStoredValue = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return deserialize(item);
      }
      // If initialValue is a function, call it
      return typeof initialValue === "function" ? initialValue() : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
  }, [key, initialValue, deserialize]);

  // State to store our value
  const [storedValue, setStoredValue] = useState(getStoredValue);

  // Update localStorage when state changes
  const setValue = useCallback(
    (value) => {
      try {
        // Allow value to be a function for same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to localStorage
        window.localStorage.setItem(key, serialize(valueToStore));

        // Dispatch custom event for cross-tab sync
        if (syncAcrossTabs) {
          window.dispatchEvent(
            new StorageEvent("storage", {
              key: key,
              newValue: serialize(valueToStore),
              oldValue: serialize(storedValue),
            }),
          );
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, serialize, syncAcrossTabs],
  );

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(
        typeof initialValue === "function" ? initialValue() : initialValue,
      );

      // Dispatch custom event for cross-tab sync
      if (syncAcrossTabs) {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: key,
            newValue: null,
            oldValue: serialize(storedValue),
          }),
        );
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue, serialize, storedValue, syncAcrossTabs]);

  // Sync across tabs
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          const newValue = e.newValue
            ? deserialize(e.newValue)
            : typeof initialValue === "function"
              ? initialValue()
              : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.error(`Error syncing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, initialValue, deserialize, syncAcrossTabs]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for managing an array in localStorage
 * @param {string} key == The localStorage key
 * @param {array} initialValue == Initial array value
 * @returns {object} == Array methods and state
 */
export function useLocalStorageArray(key, initialValue = []) {
  const [items, setItems, removeItems] = useLocalStorage(key, initialValue);

  const addItem = useCallback(
    (item) => {
      setItems((prev) => [...prev, item]);
    },
    [setItems],
  );

  const updateItem = useCallback(
    (index, newItem) => {
      setItems((prev) => {
        const updated = [...prev];
        updated[index] = newItem;
        return updated;
      });
    },
    [setItems],
  );

  const removeItem = useCallback(
    (index) => {
      setItems((prev) => prev.filter((_, i) => i !== index));
    },
    [setItems],
  );

  const clearItems = useCallback(() => {
    setItems([]);
  }, [setItems]);

  return {
    items,
    setItems,
    removeItems,
    addItem,
    updateItem,
    removeItem,
    clearItems,
    length: items.length,
  };
}

/**
 * Hook for managing an object in localStorage
 * @param {string} key == The localStorage key
 * @param {object} initialValue == Initial object value
 * @returns {object} == Object methods and state
 */
export function useLocalStorageObject(key, initialValue = {}) {
  const [object, setObject, removeObject] = useLocalStorage(key, initialValue);

  const setField = useCallback(
    (field, value) => {
      setObject((prev) => ({ ...prev, [field]: value }));
    },
    [setObject],
  );

  const getField = useCallback(
    (field) => {
      return object[field];
    },
    [object],
  );

  const removeField = useCallback(
    (field) => {
      setObject((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    },
    [setObject],
  );

  const mergeObject = useCallback(
    (newObject) => {
      setObject((prev) => ({ ...prev, ...newObject }));
    },
    [setObject],
  );

  return {
    object,
    setObject,
    removeObject,
    setField,
    getField,
    removeField,
    mergeObject,
  };
}

/**
 * Hook for managing a boolean flag in localStorage
 * @param {string} key == The localStorage key
 * @param {boolean} initialValue == Initial boolean value
 * @returns {[boolean, function, function]} == [flag, setTrue, setFalse, toggle]
 */
export function useLocalStorageBoolean(key, initialValue = false) {
  const [flag, setFlag, removeFlag] = useLocalStorage(key, initialValue);

  const setTrue = useCallback(() => setFlag(true), [setFlag]);
  const setFalse = useCallback(() => setFlag(false), [setFlag]);
  const toggle = useCallback(() => setFlag((prev) => !prev), [setFlag]);

  return [flag, setTrue, setFalse, toggle, setFlag, removeFlag];
}

/**
 * Hook for managing a numeric value in localStorage
 * @param {string} key == The localStorage key
 * @param {number} initialValue == Initial number value
 * @param {object} options == Number-specific options
 * @returns {[number, function, function]} == [value, increment, decrement, setValue]
 */
export function useLocalStorageNumber(key, initialValue = 0, options = {}) {
  const { min, max, step = 1 } = options;
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue);

  const increment = useCallback(() => {
    setValue((prev) => {
      let newValue = prev + step;
      if (max !== undefined) newValue = Math.min(newValue, max);
      return newValue;
    });
  }, [setValue, step, max]);

  const decrement = useCallback(() => {
    setValue((prev) => {
      let newValue = prev - step;
      if (min !== undefined) newValue = Math.max(newValue, min);
      return newValue;
    });
  }, [setValue, step, min]);

  return [value, increment, decrement, setValue, removeValue];
}

/**
 * Hook for managing user preferences in localStorage
 * @param {string} userId == User ID for namespacing
 * @returns {object} == User preferences methods
 */
export function useUserPreferences(userId) {
  const namespace = `user_${userId}_prefs`;
  const [preferences, setPreferences, removePreferences] =
    useLocalStorageObject(namespace, {
      theme: "light",
      notifications: true,
      language: "en",
      fontSize: "medium",
    });

  const setTheme = useCallback(
    (theme) => {
      setPreferences((prev) => ({ ...prev, theme }));
    },
    [setPreferences],
  );

  const setNotifications = useCallback(
    (enabled) => {
      setPreferences((prev) => ({ ...prev, notifications: enabled }));
    },
    [setPreferences],
  );

  const setLanguage = useCallback(
    (language) => {
      setPreferences((prev) => ({ ...prev, language }));
    },
    [setPreferences],
  );

  return {
    preferences,
    setPreferences,
    removePreferences,
    setTheme,
    setNotifications,
    setLanguage,
  };
}

/**
 * Hook for caching API responses in localStorage
 * @param {string} cacheKey == Cache key
 * @param {number} ttl == Time to live in milliseconds (default: 5 minutes)
 * @returns {object} == Cache methods
 */
export function useLocalStorageCache(cacheKey, ttl = 5 * 60 * 1000) {
  const [cache, setCache, removeCache] = useLocalStorageObject(cacheKey, {
    data: null,
    timestamp: null,
    expiresAt: null,
  });

  const get = useCallback(() => {
    if (!cache.data || !cache.expiresAt) return null;

    const now = Date.now();
    if (now > cache.expiresAt) {
      removeCache();
      return null;
    }

    return cache.data;
  }, [cache, removeCache]);

  const set = useCallback(
    (data) => {
      const now = Date.now();
      setCache({
        data,
        timestamp: now,
        expiresAt: now + ttl,
      });
    },
    [setCache, ttl],
  );

  const isValid = useCallback(() => {
    if (!cache.expiresAt) return false;
    return Date.now() <= cache.expiresAt;
  }, [cache.expiresAt]);

  const clear = useCallback(() => {
    removeCache();
  }, [removeCache]);

  return { get, set, isValid, clear, cache: cache.data };
}

// Default export
export default useLocalStorage;
