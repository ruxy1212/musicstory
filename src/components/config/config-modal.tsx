'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Settings } from 'lucide-react';
import { useKeys } from './keys-context';
import { providers } from '@/lib/providers';
import { toast } from 'sonner';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfigModal({ isOpen, onClose }: ConfigModalProps) {
  const {
    textAudioKey,
    audioProvider,
    videoGenKey,
    saveToLocalStorage,
    setKeys,
  } = useKeys();
  const [localTextAudioKey, setLocalTextAudioKey] = useState(textAudioKey);
  const [localAudioProvider, setLocalAudioProvider] = useState(audioProvider);
  const [localVideoGenKey, setLocalVideoGenKey] = useState(videoGenKey);
  const [localSave, setLocalSave] = useState(saveToLocalStorage);

  // useEffect(() => {
  //   setLocalAudioProvider(audioProvider);
  //   setLocalTextAudioKey(textAudioKey);
  //   setLocalVideoGenKey(videoGenKey);
  //   setLocalSave(saveToLocalStorage);
  // }, [audioProvider, textAudioKey, videoGenKey, saveToLocalStorage]);

  const handleSave = () => {
    setKeys({
      textAudioKey: localTextAudioKey,
      audioProvider: localAudioProvider,
      videoGenKey: localVideoGenKey,
      saveToLocalStorage: localSave,
    });
    toast.success('Configuration saved', {
      description: 'Your API keys have been updated.',
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-101 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#1A1635] border border-white/10 rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Settings className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Config Settings
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-8">
                {/* Text & Audio Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">
                    Text & Audio
                  </h3>
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-xs text-white/60 ml-1">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={localTextAudioKey}
                        onChange={(e) => setLocalTextAudioKey(e.target.value)}
                        placeholder="sk-..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-colors md:px-4 md:py-3"
                      />
                    </div>
                    <div className="w-1/3 space-y-2">
                      <label className="text-xs text-white/60 ml-1">
                        Provider
                      </label>
                      <select
                        value={localAudioProvider}
                        onChange={(e) => setLocalAudioProvider(e.target.value)}
                        className="w-full capitalize bg-[#1A1635] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/50 transition-colors appearance-none cursor-pointer md:px-4 md:py-3"
                      >
                        <option value="" className="capitalize">
                          Choose Provider
                        </option>
                        {Object.keys(providers).map((provider, i) => (
                          <option
                            key={i}
                            value={provider}
                            className="capitalize"
                          >
                            {provider}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Video Generation Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">
                    Video Generation
                  </h3>
                  <div className="space-y-2">
                    <label className="text-xs text-white/60 ml-1">
                      HuggingFace Token
                    </label>
                    <input
                      type="password"
                      value={localVideoGenKey}
                      onChange={(e) => setLocalVideoGenKey(e.target.value)}
                      placeholder="hf_..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-colors md:px-4 md:py-3"
                    />
                    <p className="text-[10px] text-white/30 italic ml-1">
                      Optional, but will guarantee higher quota for HuggingFace
                      Pro users.
                    </p>
                  </div>
                </div>

                {/* Save Preference */}
                <button
                  className="flex items-center gap-3 pt-2"
                  onClick={() => setLocalSave(!localSave)}
                >
                  <div
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      localSave
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {localSave && (
                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-sm text-white/70">
                    Save key to localstorage
                  </span>
                </button>
              </div>

              {/* Footer */}
              <div className="p-6 bg-white/2 border-t border-white/5 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-3 py-2 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition-all font-medium md:px-4 md:py-3"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.4)] md:px-4 md:py-3"
                >
                  <Save className="w-4 h-4" />
                  Save <span className="hidden md:inline">Config</span>
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
