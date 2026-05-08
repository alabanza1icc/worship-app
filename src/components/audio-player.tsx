"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
}

export function AudioPlayer({ src, title, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      await audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = Number(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("rounded-2xl bg-surface-container/50 p-4 border border-outline-variant/10 shadow-sm transition-all hover:bg-white hover:border-primary/20", className)}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-primary-glow hover:scale-105 active:scale-95 transition-all"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 fill-current" />
          ) : (
            <Play className="h-5 w-5 fill-current translate-x-0.5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          {title && (
            <div className="mb-2 truncate text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
              {title}
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-on-surface-variant/40 tabular-nums w-8">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="h-1.5 flex-1 cursor-pointer rounded-full bg-outline-variant/20 accent-primary hover:accent-primary-container transition-all"
            />
            <span className="text-[10px] font-bold text-on-surface-variant/40 tabular-nums w-8 text-right">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <button
          onClick={toggleMute}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary-container transition-all"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
