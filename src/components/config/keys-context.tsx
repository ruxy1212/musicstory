'use client';

import React, { createContext, useContext, useState } from 'react';

interface KeysContextType {
  textAudioKey: string;
  audioProvider: string;
  videoGenKey: string;
  saveToLocalStorage: boolean;
  userId: string;
  setKeys: (keys: Partial<Omit<KeysContextType, 'setKeys' | 'userId'>>) => void;
}

const KeysContext = createContext<KeysContextType | undefined>(undefined);

const getStorageItem = (key: string) => {
  if (typeof window === 'undefined') return null; // Return null during SSR
  return localStorage.getItem(key);
};

export const KeysProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId] = useState(() => {
    if (typeof window === 'undefined') return '';

    let currentUserId = localStorage.getItem('musicstory_userid');
    if (!currentUserId) {
      currentUserId = crypto.randomUUID();
      localStorage.setItem('musicstory_userid', currentUserId);
    }
    return currentUserId;
  });
  const [textAudioKey, setTextAudioKey] = useState(() => {
    const saved = getStorageItem('musicstory_keys');
    return saved ? JSON.parse(saved).textAudioKey : '';
  });
  const [videoGenKey, setVideoGenKey] = useState(() => {
    const saved = getStorageItem('musicstory_keys');
    return saved ? JSON.parse(saved).videoGenKey : '';
  });
  const [audioProvider, setAudioProvider] = useState(() => {
    const saved = getStorageItem('musicstory_keys');
    return saved ? JSON.parse(saved).audioProvider : '';
  });
  const [saveToLocalStorage, setSaveToLocalStorage] = useState(() => {
    return !!getStorageItem('musicstory_keys');
  });

  const setKeys = (newKeys: Partial<Omit<KeysContextType, 'setKeys'>>) => {
    if (newKeys.textAudioKey !== undefined)
      setTextAudioKey(newKeys.textAudioKey);
    if (newKeys.audioProvider !== undefined)
      setAudioProvider(newKeys.audioProvider);
    if (newKeys.videoGenKey !== undefined) setVideoGenKey(newKeys.videoGenKey);
    if (newKeys.saveToLocalStorage !== undefined)
      setSaveToLocalStorage(newKeys.saveToLocalStorage);

    // Save to local storage if enabled
    if (
      newKeys.saveToLocalStorage === true ||
      (newKeys.saveToLocalStorage === undefined && saveToLocalStorage)
    ) {
      const toSave = {
        textAudioKey: newKeys.textAudioKey ?? textAudioKey,
        audioProvider: newKeys.audioProvider ?? audioProvider,
        videoGenKey: newKeys.videoGenKey ?? videoGenKey,
      };
      localStorage.setItem('musicstory_keys', JSON.stringify(toSave));
    } else if (newKeys.saveToLocalStorage === false) {
      localStorage.removeItem('musicstory_keys');
    }
  };

  return (
    <KeysContext.Provider
      value={{
        textAudioKey,
        audioProvider,
        videoGenKey,
        saveToLocalStorage,
        userId,
        setKeys,
      }}
    >
      {children}
    </KeysContext.Provider>
  );
};

export const useKeys = () => {
  const context = useContext(KeysContext);
  if (context === undefined) {
    throw new Error('useKeys must be used within a KeysProvider');
  }
  return context;
};
