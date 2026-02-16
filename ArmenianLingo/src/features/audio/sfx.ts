"use client";

function playTone(frequency: number, durationMs: number) {
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.08;

  oscillator.start();
  oscillator.stop(context.currentTime + durationMs / 1000);

  oscillator.onended = () => {
    context.close().catch(() => undefined);
  };
}

export function playCorrect() {
  playTone(620, 120);
}

export function playWrong() {
  playTone(180, 180);
}

export function playDictationCue(ref?: string) {
  const map: Record<string, number[]> = {
    "audio-hello": [300, 350],
    "audio-thank-you": [260, 380, 420]
  };

  const frequencies = map[ref ?? ""] ?? [320];
  frequencies.forEach((freq, index) => {
    window.setTimeout(() => playTone(freq, 120), index * 180);
  });
}
