import { useCallback, useEffect, useRef, useState } from "react";

const ERRORS = {
  "not-allowed":
    "Microphone is blocked. Click the lock icon in the address bar and allow it.",
  "service-not-allowed":
    "Microphone is blocked. Click the lock icon in the address bar and allow it.",
  "no-speech": "Didn’t catch any speech. Click the mic and try again.",
  network: "Chrome couldn’t reach the speech service. Check your connection.",
  "audio-capture": "No microphone found. Check Windows sound settings.",
};

export function useSpeech({ onResult }) {
  const recRef = useRef(null);
  const onResultRef = useRef(onResult);
  const finalsRef = useRef("");
  const watchRef = useRef(0);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState("");

  onResultRef.current = onResult;

  useEffect(() => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(Boolean(Ctor));
    if (!Ctor) return undefined;

    const rec = new Ctor();
    rec.lang = navigator.language?.startsWith("en") ? navigator.language : "en-IN";
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      let finals = finalsRef.current;
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const piece = event.results[i][0]?.transcript || "";
        if (event.results[i].isFinal) {
          finals = `${finals} ${piece}`.trim();
        } else {
          interim = `${interim} ${piece}`.trim();
        }
      }
      finalsRef.current = finals;
      const shown = [finals, interim].filter(Boolean).join(" ").trim();
      if (shown) {
        window.clearTimeout(watchRef.current);
        setError("");
        onResultRef.current(shown);
      }
    };

    rec.onstart = () => {
      setListening(true);
      setError("");
    };

    rec.onend = () => {
      setListening(false);
      window.clearTimeout(watchRef.current);
    };

    rec.onerror = (event) => {
      const message = ERRORS[event.error];
      if (message) setError(message);
      if (event.error !== "no-speech" && event.error !== "aborted") {
        setListening(false);
      }
    };

    recRef.current = rec;

    return () => {
      window.clearTimeout(watchRef.current);
      rec.onresult = null;
      rec.onstart = null;
      rec.onend = null;
      rec.onerror = null;
      try {
        rec.abort();
      } catch {
        /* ignore */
      }
      recRef.current = null;
    };
  }, []);

  const toggle = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;

    if (listening) {
      window.clearTimeout(watchRef.current);
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      setListening(false);
      return;
    }

    finalsRef.current = "";
    setError("");
    try {
      rec.start();
      setListening(true);
      watchRef.current = window.setTimeout(() => {
        setError(
          "Still listening, but nothing reached the box. Allow the mic, speak clearly, then click the mic to stop."
        );
      }, 8000);
    } catch {
      try {
        rec.stop();
        rec.start();
        setListening(true);
      } catch {
        setListening(false);
        setError("Couldn’t start the mic. Click it once more.");
      }
    }
  }, [listening]);

  return { listening, supported, toggle, error };
}
