"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import {
  Maximize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAYBACK_SPEEDS } from "@/features/courses/constants";
import { formatTimestamp } from "@/features/lesson-player/utils";
import { cn } from "@/lib/utils";

type VideoControlsProps = {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackSpeed: number;
  onPlayPause: () => void;
  onSeekBack: () => void;
  onSeekForward: () => void;
  onSeek: (value: number) => void;
  onVolumeChange: (value: number) => void;
  onSpeedChange: (speed: number) => void;
  onFullscreen: () => void;
};

function VideoControlsComponent({
  isPlaying,
  currentTime,
  duration,
  volume,
  playbackSpeed,
  onPlayPause,
  onSeekBack,
  onSeekForward,
  onSeek,
  onVolumeChange,
  onSpeedChange,
  onFullscreen
}: VideoControlsProps) {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      aria-label="Video controls"
      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-4 pb-4 pt-10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      role="toolbar"
    >
      <div className="mb-3">
        <input
          aria-label="Playback progress"
          aria-valuemax={duration}
          aria-valuemin={0}
          aria-valuenow={currentTime}
          className="accent-accent h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/25"
          max={duration || 100}
          min={0}
          onChange={(event) => onSeek(Number(event.target.value))}
          step={0.1}
          type="range"
          value={currentTime}
        />
        <motion.div
          animate={{ width: `${progress}%` }}
          aria-hidden
          className="bg-accent pointer-events-none -mt-1.5 h-1.5 rounded-full"
          initial={false}
          transition={{ duration: 0.15 }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button
            aria-label={isPlaying ? "Pause" : "Play"}
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={onPlayPause}
            size="icon"
            type="button"
            variant="ghost"
          >
            {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
          </Button>
          <Button
            aria-label="Back 10 seconds"
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={onSeekBack}
            size="icon"
            type="button"
            variant="ghost"
          >
            <RotateCcw className="size-4" />
          </Button>
          <Button
            aria-label="Forward 10 seconds"
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={onSeekForward}
            size="icon"
            type="button"
            variant="ghost"
          >
            <RotateCw className="size-4" />
          </Button>
          <span className="text-xs text-white/80 tabular-nums">
            {formatTimestamp(currentTime)} / {formatTimestamp(duration)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              aria-expanded={showSpeedMenu}
              aria-haspopup="listbox"
              aria-label="Playback speed"
              className="text-xs text-white hover:bg-white/10 hover:text-white"
              onClick={() => setShowSpeedMenu((value) => !value)}
              size="sm"
              type="button"
              variant="ghost"
            >
              {playbackSpeed}x
            </Button>
            {showSpeedMenu ? (
              <ul
                className="absolute bottom-full right-0 mb-2 min-w-[80px] rounded-md border bg-background p-1 shadow-md"
                role="listbox"
              >
                {PLAYBACK_SPEEDS.map((speed) => (
                  <li key={speed}>
                    <button
                      className={cn(
                        "hover:bg-muted w-full rounded px-3 py-1.5 text-left text-xs",
                        speed === playbackSpeed && "bg-muted font-medium"
                      )}
                      onClick={() => {
                        onSpeedChange(speed);
                        setShowSpeedMenu(false);
                      }}
                      role="option"
                      aria-selected={speed === playbackSpeed}
                      type="button"
                    >
                      {speed}x
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <Button
            aria-label={volume === 0 ? "Unmute" : "Mute"}
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={() => onVolumeChange(volume === 0 ? 1 : 0)}
            size="icon"
            type="button"
            variant="ghost"
          >
            {volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </Button>
          <input
            aria-label="Volume"
            className="accent-accent hidden w-20 sm:block"
            max={1}
            min={0}
            onChange={(event) => onVolumeChange(Number(event.target.value))}
            step={0.05}
            type="range"
            value={volume}
          />
          <Button
            aria-label="Fullscreen"
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={onFullscreen}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Maximize className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export const VideoControls = memo(VideoControlsComponent);
VideoControls.displayName = "VideoControls";
