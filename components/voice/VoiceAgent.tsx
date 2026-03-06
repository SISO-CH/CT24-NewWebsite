"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Status = "idle" | "listening" | "thinking" | "speaking";

const STATUS_CONFIG: Record<Status, { color: string; label: string }> = {
  idle:      { color: "#6b7280", label: "Tippen Sie auf das Mikrofon, um zu sprechen" },
  listening: { color: "#e4007d", label: "Ich hoere zu ..." },
  thinking:  { color: "#00a0e3", label: "Einen Moment ..." },
  speaking:  { color: "#009640", label: "Antwort wird gesprochen ..." },
};

interface Props {
  vehicleContext?: string;
}

export default function VoiceAgent({ vehicleContext }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cfg = STATUS_CONFIG[status];

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
  }, []);

  const processAudio = useCallback(
    async (blob: Blob) => {
      setError("");
      setStatus("thinking");

      try {
        // 1. Transcribe
        const form = new FormData();
        form.append("audio", blob);
        const sttRes = await fetch("/api/voice/transcribe", { method: "POST", body: form });
        if (!sttRes.ok) throw new Error("Spracherkennung fehlgeschlagen");
        const { text: userText } = (await sttRes.json()) as { text: string };
        if (!userText.trim()) {
          setStatus("idle");
          setError("Kein Text erkannt. Bitte versuchen Sie es erneut.");
          return;
        }
        setTranscript(userText);

        // 2. Chat (SSE stream)
        const newMessages: { role: "user" | "assistant"; content: string }[] = [
          ...messages,
          { role: "user" as const, content: vehicleContext ? `[Kontext: ${vehicleContext}]\n${userText}` : userText },
        ];

        const chatRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
        });

        if (!chatRes.ok || !chatRes.body) throw new Error("Chat fehlgeschlagen");

        const reader = chatRes.body.getReader();
        const decoder = new TextDecoder();
        let assistantText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
          for (const line of lines) {
            const payload = line.slice(6);
            if (payload === "[DONE]") break;
            try {
              const parsed = JSON.parse(payload) as { text?: string; error?: string };
              if (parsed.text) {
                assistantText += parsed.text;
                setResponse(assistantText);
              }
            } catch { /* skip malformed chunks */ }
          }
        }

        if (!assistantText) throw new Error("Keine Antwort erhalten");

        setMessages([
          ...newMessages,
          { role: "assistant", content: assistantText },
        ]);

        // 3. Speak
        setStatus("speaking");
        const ttsRes = await fetch("/api/voice/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: assistantText }),
        });

        if (ttsRes.ok) {
          const audioBlob = await ttsRes.blob();
          const url = URL.createObjectURL(audioBlob);
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => {
            URL.revokeObjectURL(url);
            setStatus("idle");
          };
          audio.onerror = () => {
            URL.revokeObjectURL(url);
            setStatus("idle");
          };
          await audio.play();
        } else {
          // TTS failed — fall back silently
          setStatus("idle");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
        setStatus("idle");
      }
    },
    [messages, vehicleContext],
  );

  const handleMicClick = useCallback(async () => {
    if (status === "listening") {
      stopRecording();
      return;
    }

    if (status === "speaking" && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setStatus("idle");
      return;
    }

    if (status !== "idle") return;

    setError("");
    setTranscript("");
    setResponse("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        processAudio(blob);
      };

      recorder.start();
      setStatus("listening");
    } catch {
      setError("Mikrofonzugriff verweigert. Bitte erlauben Sie den Zugriff in Ihren Browser-Einstellungen.");
    }
  }, [status, stopRecording, processAudio]);

  const MicIcon = status === "listening" ? MicOff : status === "speaking" ? Volume2 : status === "thinking" ? Loader2 : Mic;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: "var(--ct-dark, #1b1b1b)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-[#9ca3af] hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Zurueck
        </Link>
        <p className="text-sm font-bold text-white tracking-wider">Car Trade24</p>
        <div className="w-16" /> {/* spacer */}
      </div>

      {/* Center area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {/* Outer glow ring */}
        <div className="relative flex items-center justify-center">
          <div
            className="absolute w-32 h-32 rounded-full transition-colors duration-500"
            style={{ backgroundColor: `${cfg.color}33` }}
          />
          <button
            onClick={handleMicClick}
            disabled={status === "thinking"}
            className="relative w-20 h-20 rounded-full flex items-center justify-center text-white
                       transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: cfg.color }}
            aria-label={cfg.label}
          >
            <MicIcon size={32} className={status === "thinking" ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Status text */}
        <p className="text-sm text-[#9ca3af] text-center">{cfg.label}</p>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400 text-center max-w-sm">{error}</p>
        )}

        {/* Conversation bubbles */}
        <div className="w-full max-w-md space-y-3 overflow-y-auto max-h-[40vh] px-2">
          {transcript && (
            <div className="flex justify-end">
              <div className="rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%]" style={{ backgroundColor: "#e4007d22" }}>
                <p className="text-xs text-[#9ca3af] mb-0.5">Sie</p>
                <p className="text-sm text-white">{transcript}</p>
              </div>
            </div>
          )}
          {response && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[85%]" style={{ backgroundColor: "#00a0e322" }}>
                <p className="text-xs text-[#9ca3af] mb-0.5">Assistent</p>
                <p className="text-sm text-white">{response}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] text-[#6b7280] pb-6">
        Powered by Car Trade24 KI-Assistent
      </p>
    </div>
  );
}
