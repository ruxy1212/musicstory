'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface KeysContextType {
  textAudioKey: string;
  audioProvider: string;
  videoGenKey: string;
  saveToLocalStorage: boolean;
  setKeys: (keys: Partial<Omit<KeysContextType, 'setKeys'>>) => void;
}

const KeysContext = createContext<KeysContextType | undefined>(undefined);

export const KeysProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [textAudioKey, setTextAudioKey] = useState('');
  const [audioProvider, setAudioProvider] = useState('');
  const [videoGenKey, setVideoGenKey] = useState('');
  const [saveToLocalStorage, setSaveToLocalStorage] = useState(false);

  // Initialize from local storage
  useEffect(() => {
    const saved = localStorage.getItem('musicstory_keys');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTextAudioKey(parsed.textAudioKey || '');
        setAudioProvider(parsed.audioProvider || '');
        setVideoGenKey(parsed.videoGenKey || '');
        setSaveToLocalStorage(true);
      } catch (e) {
        console.error('Failed to parse saved keys', e);
      }
    }
  }, []);

  const setKeys = (newKeys: Partial<Omit<KeysContextType, 'setKeys'>>) => {
    if (newKeys.textAudioKey !== undefined) setTextAudioKey(newKeys.textAudioKey);
    if (newKeys.audioProvider !== undefined) setAudioProvider(newKeys.audioProvider);
    if (newKeys.videoGenKey !== undefined) setVideoGenKey(newKeys.videoGenKey);
    if (newKeys.saveToLocalStorage !== undefined) setSaveToLocalStorage(newKeys.saveToLocalStorage);

    // Save to local storage if enabled
    if (newKeys.saveToLocalStorage === true || (newKeys.saveToLocalStorage === undefined && saveToLocalStorage)) {
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
    <KeysContext.Provider value={{ textAudioKey, audioProvider, videoGenKey, saveToLocalStorage, setKeys }}>
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
