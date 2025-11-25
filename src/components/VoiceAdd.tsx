import React, { useState, useRef } from "react";

export default function VoiceAdd({ onSubmit }: any) {
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");

  const recogRef = useRef<any>(null);

  function startListening() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support voice recognition.");
      return;
    }

    const recog = new SpeechRecognition();
    recogRef.current = recog;

    recog.lang = "en-US";
    recog.continuous = false;
    recog.interimResults = false;

    recog.onstart = () => setListening(true);

    recog.onerror = (e: any) => {
      setListening(false);
      console.warn("Speech error:", e.error);

      if (e.error === "not-allowed") {
        alert("Microphone permission blocked. Enable it in Chrome settings.");
      }
    };

    recog.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setText(transcript);
      onSubmit(transcript);
    };

    recog.onend = () => {
      setListening(false);
    };

    // MUST be triggered only after user click (Chrome requirement)
    recog.start();
  }

  function stopListening() {
    if (recogRef.current) {
      recogRef.current.stop();
      setListening(false);
    }
  }

  return (
    <div className="flex gap-2 items-center">
      {!listening ? (
        <button
          onClick={startListening}
          className="px-3 py-1 rounded bg-gray-200"
        >
          🎤 Start
        </button>
      ) : (
        <button
          onClick={stopListening}
          className="px-3 py-1 rounded bg-red-500 text-white"
        >
          ⏹ Stop
        </button>
      )}
    </div>
  );
}
