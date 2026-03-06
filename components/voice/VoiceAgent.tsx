"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, Loader2, X, Minus } from "lucide-react";

type Status = "idle" | "listening" | "thinking" | "speaking";

const STATUS_CONFIG: Record<Status, { color: string; label: string }> = {
  idle:      { color: "#6b7280", label: "Tippen Sie auf das Mikrofon" },
  listening: { color: "#e4007d", label: "Ich höre zu ..." },
  thinking:  { color: "#00a0e3", label: "Einen Moment ..." },
  speaking:  { color: "#009640", label: "Antwort wird gesprochen ..." },
};

interface Props {
  vehicleContext?: string;
}

export default function VoiceAgent({ vehicleContext }: Props) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
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
    // If widget is closed, open it
    if (!open) {
      setOpen(true);
      return;
    }

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
  }, [open, status, stopRecording, processAudio]);

  function getMicIcon() {
    switch (status) {
      case "listening": return MicOff;
      case "speaking":  return Volume2;
      case "thinking":  return Loader2;
      default:          return Mic;
    }
  }
  const MicIcon = getMicIcon();

  /* ── Floating button (when closed) ── */
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center
                   text-white shadow-lg hover:scale-110 transition-transform duration-200"
        style={{ backgroundColor: "var(--ct-cyan)" }}
        aria-label="Sprachassistent öffnen"
      >
        <Mic size={24} />
      </button>
    );
  }

  /* ── Minimized pill ── */
  if (minimized) {
    return (
      <div
        className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-full px-4 py-2
                   shadow-lg cursor-pointer hover:scale-105 transition-transform"
        style={{ backgroundColor: "var(--ct-dark)" }}
        onClick={() => setMinimized(false)}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: status === "idle" ? "#6b7280" : cfg.color }}
        />
        <span className="text-xs text-white font-medium">Sprachassistent</span>
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(false); setMinimized(false); }}
          className="ml-1 text-[#9ca3af] hover:text-white"
          aria-label="Schliessen"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  /* ── Open widget panel ── */
  return (
    <div
      className="fixed bottom-20 right-4 z-50 w-[340px] max-h-[480px] rounded-2xl shadow-2xl
                 flex flex-col overflow-hidden border border-[#333]"
      style={{ backgroundColor: "var(--ct-dark, #1b1b1b)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#333]">
        <p className="text-sm font-bold text-white">Sprachassistent</p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimized(true)}
            className="p-1 text-[#9ca3af] hover:text-white transition-colors"
            aria-label="Minimieren"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={() => { setOpen(false); if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } setStatus("idle"); }}
            className="p-1 text-[#9ca3af] hover:text-white transition-colors"
            aria-label="Schliessen"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Conversation area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 min-h-[160px] max-h-[280px]">
        {!transcript && !response && !error && (
          <p className="text-xs text-[#6b7280] text-center py-6">
            Drücken Sie das Mikrofon und stellen Sie Ihre Frage.
          </p>
        )}
        {transcript && (
          <div className="flex justify-end">
            <div className="rounded-xl rounded-br-sm px-3 py-2 max-w-[85%]" style={{ backgroundColor: "#e4007d22" }}>
              <p className="text-[10px] text-[#9ca3af] mb-0.5">Sie</p>
              <p className="text-xs text-white leading-relaxed">{transcript}</p>
            </div>
          </div>
        )}
        {response && (
          <div className="flex justify-start">
            <div className="rounded-xl rounded-bl-sm px-3 py-2 max-w-[85%]" style={{ backgroundColor: "#00a0e322" }}>
              <p className="text-[10px] text-[#9ca3af] mb-0.5">Assistent</p>
              <p className="text-xs text-white leading-relaxed">{response}</p>
            </div>
          </div>
        )}
        {error && (
          <p className="text-xs text-red-400 text-center">{error}</p>
        )}
      </div>

      {/* Mic button + status */}
      <div className="flex flex-col items-center gap-2 px-4 py-4 border-t border-[#333]">
        <div className="relative flex items-center justify-center">
          <div
            className="absolute w-16 h-16 rounded-full transition-colors duration-500"
            style={{ backgroundColor: `${cfg.color}33` }}
          />
          <button
            onClick={handleMicClick}
            disabled={status === "thinking"}
            className="relative w-12 h-12 rounded-full flex items-center justify-center text-white
                       transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: cfg.color }}
            aria-label={cfg.label}
          >
            <MicIcon size={22} className={status === "thinking" ? "animate-spin" : ""} />
          </button>
        </div>
        <p className="text-[10px] text-[#6b7280] text-center">{cfg.label}</p>
      </div>
    </div>
  );
}
