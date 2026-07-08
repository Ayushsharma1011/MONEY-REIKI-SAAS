"use client";

import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoControls } from "@/features/lesson-player/components/video-controls";
import { LessonError } from "@/features/lesson-player/components/lesson-error";
import type { LessonVideoViewModel, VideoPlayerRef } from "@/features/lesson-player/types";
import { cn } from "@/lib/utils";

type VideoPlayerProps = {
  video: LessonVideoViewModel;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlaybackSpeedChange?: (speed: number) => void;
  onEnded?: () => void;
};

const VideoPlayerComponent = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  function VideoPlayerComponent({ video, onTimeUpdate, onPlaybackSpeedChange, onEnded }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(video.resumePositionSeconds);
    const [duration, setDuration] = useState(video.durationSeconds);
    const [volume, setVolume] = useState(1);
    const [playbackSpeed, setPlaybackSpeed] = useState(video.playbackSpeed);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasResumed, setHasResumed] = useState(false);

    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = seconds;
          setCurrentTime(seconds);
        }
      },
      play: () => void videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
      togglePlay: () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) void videoRef.current.play();
        else videoRef.current.pause();
      },
      getCurrentTime: () => videoRef.current?.currentTime ?? 0,
      getDuration: () => videoRef.current?.duration ?? duration
    }));

    useEffect(() => {
      const element = videoRef.current;
      if (!element || !video.url || hasResumed) return;
      if (video.resumePositionSeconds > 0) {
        element.currentTime = video.resumePositionSeconds;
        setCurrentTime(video.resumePositionSeconds);
      }
      element.playbackRate = video.playbackSpeed;
      setPlaybackSpeed(video.playbackSpeed);
      setHasResumed(true);
    }, [hasResumed, video.playbackSpeed, video.resumePositionSeconds, video.url]);

    const togglePlay = useCallback(() => {
      const element = videoRef.current;
      if (!element) return;
      if (element.paused) void element.play();
      else element.pause();
    }, []);

    const seekBy = useCallback((delta: number) => {
      const element = videoRef.current;
      if (!element) return;
      const next = Math.max(0, Math.min(element.duration || duration, element.currentTime + delta));
      element.currentTime = next;
      setCurrentTime(next);
    }, [duration]);

    const handleSeek = useCallback((value: number) => {
      const element = videoRef.current;
      if (!element) return;
      element.currentTime = value;
      setCurrentTime(value);
    }, []);

    const toggleFullscreen = useCallback(async () => {
      const container = containerRef.current;
      if (!container) return;
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    }, []);

    const handleSpeedChange = useCallback(
      (speed: number) => {
        if (videoRef.current) videoRef.current.playbackRate = speed;
        setPlaybackSpeed(speed);
        onPlaybackSpeedChange?.(speed);
      },
      [onPlaybackSpeedChange]
    );

    const handleVolumeChange = useCallback((value: number) => {
      if (videoRef.current) videoRef.current.volume = value;
      setVolume(value);
    }, []);

    if (video.state === "none" || video.state === "processing") {
      return (
        <LessonError
          message={video.errorMessage ?? undefined}
          onRetry={video.state === "processing" ? () => window.location.reload() : undefined}
          variant={video.state === "none" ? "no-video" : "processing"}
        />
      );
    }

    if (hasError || !video.url) {
      return (
        <LessonError
          message={video.errorMessage ?? undefined}
          onRetry={() => {
            setHasError(false);
            setIsLoading(true);
          }}
          variant="playback"
        />
      );
    }

    return (
      <motion.div
        animate={{ opacity: 1 }}
        className="group relative overflow-hidden rounded-2xl border bg-black shadow-lg"
        initial={{ opacity: 0 }}
        ref={containerRef}
      >
        {isLoading ? (
          <Skeleton className="absolute inset-0 z-10 aspect-video w-full rounded-none" />
        ) : null}
        {video.thumbnailUrl && isLoading ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="absolute inset-0 z-[1] size-full object-cover opacity-40"
            src={video.thumbnailUrl}
          />
        ) : null}
        <video
          aria-label="Lesson video player"
          className={cn("aspect-video w-full bg-black", isLoading && "opacity-0")}
          onCanPlay={() => setIsLoading(false)}
          onDurationChange={(event) => {
            const next = event.currentTarget.duration;
            if (Number.isFinite(next)) setDuration(next);
          }}
          onEnded={() => {
            setIsPlaying(false);
            onEnded?.();
          }}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onTimeUpdate={(event) => {
            const next = event.currentTarget.currentTime;
            const total = event.currentTarget.duration || duration;
            setCurrentTime(next);
            onTimeUpdate?.(next, total);
          }}
          playsInline
          poster={video.thumbnailUrl ?? undefined}
          preload="metadata"
          ref={videoRef}
          src={video.url}
        >
          <track kind="captions" label="Captions placeholder" srcLang="en" />
        </video>
        <VideoControls
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onFullscreen={toggleFullscreen}
          onPlayPause={togglePlay}
          onSeek={handleSeek}
          onSeekBack={() => seekBy(-10)}
          onSeekForward={() => seekBy(10)}
          onSpeedChange={handleSpeedChange}
          onVolumeChange={handleVolumeChange}
          playbackSpeed={playbackSpeed}
          volume={volume}
        />
      </motion.div>
    );
  }
);

export const VideoPlayer = memo(VideoPlayerComponent);
VideoPlayer.displayName = "VideoPlayer";
