"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bot,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  SendHorizontal,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import { assistantApi } from "@/lib/api";
import { getStoredSession } from "@/lib/auth";

const INDIAN_ENGLISH_HINTS = [
  "en-in",
  "india",
  "indian",
  "female",
  "heera",
  "neerja",
  "lekha",
  "aditi",
  "priya",
  "kavya",
];

const buildInitialMessage = () => ({
  id: 1,
  role: "assistant",
  text: "Hello! I am your Civic Connect assistant. Ask me about complaint filing, portal usage, or your complaint status.",
});

const splitForSpeech = (text) =>
  text
    .split(/(?<=[.?!])\s+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

const scoreVoice = (voice) => {
  const meta = `${voice.name || ""} ${voice.voiceURI || ""}`.toLowerCase();
  const lang = (voice.lang || "").toLowerCase();
  let score = 0;

  if (lang === "en-in") {
    score += 260;
  } else if (lang === "hi-in") {
    score += 120;
  } else if (lang.startsWith("en")) {
    score += 70;
  }

  for (const hint of INDIAN_ENGLISH_HINTS) {
    if (meta.includes(hint)) {
      score += 30;
    }
  }

  if (!voice.localService) {
    score += 20;
  }

  return score;
};

const pickPreferredVoice = (voices = []) => {
  if (!voices.length) {
    return null;
  }

  return [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null;
};

export function VoiceAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [input, setInput] = useState("");
  const [notice, setNotice] = useState("");
  const [messages, setMessages] = useState([buildInitialMessage()]);

  const nextIdRef = useRef(2);
  const listRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const voicesRef = useRef([]);
  const preferredVoiceRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }

    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [isOpen, messages]);

  const appendMessage = useCallback((role, text) => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    setMessages((current) => [...current, { id, role, text }]);
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.src?.startsWith("blob:")) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      audioRef.current = null;
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  useEffect(
    () => () => {
      stopAudio();
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      }
    },
    [stopAudio]
  );

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      voicesRef.current = voices;
      preferredVoiceRef.current = pickPreferredVoice(voices);
    };

    updateVoices();
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
  }, []);

  const speakWithBrowserVoice = useCallback(
    async (text) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        return false;
      }

      const parts = splitForSpeech(text);
      if (!parts.length) {
        return false;
      }

      stopAudio();

      for (const part of parts) {
        await new Promise((resolve) => {
          const utterance = new SpeechSynthesisUtterance(part);
          const picked = preferredVoiceRef.current || pickPreferredVoice(voicesRef.current);
          if (picked) {
            utterance.voice = picked;
            utterance.lang = picked.lang || "en-IN";
          } else {
            utterance.lang = "en-IN";
          }
          utterance.pitch = 1.1;
          utterance.rate = 0.95;
          utterance.volume = 1;
          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();
          window.speechSynthesis.speak(utterance);
        });
      }

      return true;
    },
    [stopAudio]
  );

  const speakWithHdVoice = useCallback(
    async (text) => {
      try {
        const response = await fetch("/api/assistant/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          return false;
        }

        const audioBlob = await response.blob();
        if (!audioBlob.size) {
          return false;
        }

        stopAudio();
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audio.preload = "auto";
        audioRef.current = audio;
        await audio.play();
        return true;
      } catch {
        return false;
      }
    },
    [stopAudio]
  );

  const speakReply = useCallback(
    async (text) => {
      if (!voiceEnabled) {
        return;
      }

      const playedHd = await speakWithHdVoice(text);
      if (playedHd) {
        return;
      }
      await speakWithBrowserVoice(text);
    },
    [speakWithBrowserVoice, speakWithHdVoice, voiceEnabled]
  );

  const sendMessage = useCallback(
    async (rawMessage) => {
      const message = String(rawMessage || "").trim();
      if (!message || isSending) {
        return;
      }

      setNotice("");
      appendMessage("user", message);
      setInput("");
      setIsSending(true);

      try {
        const session = getStoredSession();
        const response = await assistantApi.chat({
          token: session?.token || "",
          message,
          history: [
            ...messages.map((entry) => ({
              role: entry.role,
              text: entry.text,
            })),
            { role: "user", text: message },
          ],
        });

        appendMessage("assistant", response.reply);
        void speakReply(response.reply);
      } catch (error) {
        appendMessage(
          "assistant",
          error.message || "Assistant is temporarily unavailable. Please try again."
        );
      } finally {
        setIsSending(false);
      }
    },
    [appendMessage, isSending, messages, speakReply]
  );

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {
      return;
    }
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setNotice("Voice input is not supported in this browser. Please type your message.");
      return;
    }

    setNotice("Listening...");

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalText = "";

    recognition.onresult = (event) => {
      let interimText = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript || "";
        if (event.results[index].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      setInput((finalText || interimText).trim());
    };

    recognition.onerror = () => {
      setNotice("Voice capture failed. Please try again.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      const captured = finalText.trim();
      if (!captured) {
        setNotice("No voice detected. Please try again.");
        return;
      }

      setNotice("");
      sendMessage(captured);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [sendMessage]);

  return (
    <div className="fixed bottom-5 right-4 z-40 sm:right-6">
      {isOpen ? (
        <section className="glass-panel flex h-[520px] w-[min(92vw,390px)] flex-col overflow-hidden rounded-2xl border border-blue-200 bg-white/95">
          <header className="flex items-center justify-between border-b border-blue-100 bg-white/90 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lagoon text-white">
                <Bot className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">AI Voice + Chat Assistant</p>
                <p className="text-xs text-slate-500">English support (Indian accent)</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-full p-2 text-slate-500 transition hover:bg-blue-50 hover:text-lagoon"
                onClick={() => setVoiceEnabled((current) => !current)}
                aria-label={voiceEnabled ? "Disable voice output" : "Enable voice output"}
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button
                type="button"
                className="rounded-full p-2 text-slate-500 transition hover:bg-blue-50 hover:text-lagoon"
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-mist/35 px-3 py-3">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`max-w-[92%] whitespace-pre-line rounded-2xl px-3 py-2.5 text-sm leading-6 ${
                  message.role === "assistant"
                    ? "mr-auto border border-blue-100 bg-white text-slate-700"
                    : "ml-auto bg-lagoon text-white"
                }`}
              >
                {message.text}
              </article>
            ))}
            {isSending ? (
              <div className="mr-auto inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-3 py-2 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin text-lagoon" />
                Thinking...
              </div>
            ) : null}
          </div>

          <div className="border-t border-blue-100 bg-white/95 p-3">
            {notice ? (
              <p className="mb-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                {notice}
              </p>
            ) : null}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask your question..."
                className="h-11 flex-1 rounded-xl border border-blue-200 bg-white px-3 text-sm outline-none ring-lagoon/30 transition focus:ring-2"
              />
              <button
                type="button"
                className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                  isListening
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-blue-200 bg-blue-50 text-lagoon"
                } transition`}
                onClick={isListening ? stopListening : startListening}
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-lagoon text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={() => sendMessage(input)}
                disabled={isSending}
                aria-label="Send message"
              >
                <SendHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      ) : (
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-lagoon px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-700"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI assistant"
        >
          <MessageCircle className="h-4 w-4" />
          AI Assistant
        </button>
      )}
    </div>
  );
}
