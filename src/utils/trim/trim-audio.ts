export const trimAudio = async (file: File | Blob, start: number, stop: number) => {
  const audioCtx = new (window.AudioContext  || (window as any).webkitAudioContext)();

  // Get audio data
  let arrayBuffer;
  if (file instanceof File || file instanceof Blob) {
    arrayBuffer = await file.arrayBuffer();
  } else {
    const response = await fetch(file);
    arrayBuffer = await response.arrayBuffer();
  }

  // Decode the audio
  const originalBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const duration = stop - start;
  const targetSampleRate = 16000;
  const targetChannels = 1;

  // Calculate number of samples needed at target sample rate
  const targetLength = Math.ceil(duration * targetSampleRate);

  const offlineCtx = new OfflineAudioContext({
    numberOfChannels: targetChannels,
    length: targetLength,
    sampleRate: targetSampleRate,
  });

  // Create a buffer source and set the original audio
  const source = offlineCtx.createBufferSource();
  source.buffer = originalBuffer;

  // Connect directly to destination
  source.connect(offlineCtx.destination);
  source.start(0, start, duration);
  const trimmedBuffer = await offlineCtx.startRendering();

  // Encode to WAV
  return encodeBufferToWavBlob(trimmedBuffer);
}

const encodeBufferToWavBlob = (buffer: AudioBuffer) => {
  const numberOfChannels = buffer.numberOfChannels;
  const length = (buffer.length * numberOfChannels * 2) + 44; //16-bit PCM
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray)
  const channels = [];
  let offset = 0;
  let pos = 0;

  // Helper to write strings
  const setString = (data: string) => {
    for (let i = 0; i < data.length; i++) {
      view.setUint8(pos++, data.charCodeAt(i));
    }
  };

  // Write WAV Header
  setString('RIFF');
  view.setUint32(pos, length - 8, true); pos += 4;
  setString('WAVE');
  setString('fmt ');
  view.setUint32(pos, 16, true); pos += 4;
  view.setUint16(pos, 1, true); pos += 2; // PCM
  view.setUint16(pos, numberOfChannels, true); pos += 2;
  view.setUint32(pos, buffer.sampleRate, true); pos += 4;
  view.setUint32(pos, buffer.sampleRate * 2 * numberOfChannels, true); pos += 4;
  view.setUint16(pos, numberOfChannels * 2, true); pos += 2;
  view.setUint16(pos, 16, true); pos += 2; // 16-bit
  setString('data');
  view.setUint32(pos, length - pos - 4, true); pos += 4;

  // Interleave and write audio data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numberOfChannels; i++) {
      // Clamp the sample to 16-bit PCM limits
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([bufferArray], { type: 'audio/wav' });
}