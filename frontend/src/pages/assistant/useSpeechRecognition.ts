import { useCallback, useEffect, useRef, useState } from "react";

// Минимальные типы Web Speech API (в стандартном lib.dom их нет).
interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

interface Options {
  lang?: string;
  onError?: (error: string) => void;
}

/**
 * Голосовой ввод через браузерный Web Speech API.
 * Хранит распознанный текст (final) и текущую гипотезу (interim),
 * чтобы показывать их в реальном времени.
 */
export function useSpeechRecognition({ lang = "ru-RU", onError }: Options = {}) {
  const [supported] = useState(() => getCtor() != null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
    setInterim("");
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setInterim("");
  }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) return;
    recognitionRef.current?.abort();

    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let final = "";
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) final += res[0].transcript;
        else live += res[0].transcript;
      }
      if (final) setTranscript((prev) => (prev ? `${prev} ${final.trim()}` : final.trim()));
      setInterim(live);
    };
    rec.onerror = (e) => {
      setListening(false);
      onErrorRef.current?.(e.error);
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
    };

    recognitionRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [lang]);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  return { supported, listening, transcript, interim, setTranscript, start, stop, reset };
}
