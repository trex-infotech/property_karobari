"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

function PlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M16 3h3a2 2 0 0 1 2 2v3" />
      <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M11 5 6 9H2v6h4l5 4z" />
      {muted ? (
        <>
          <line x1="22" x2="16" y1="9" y2="15" />
          <line x1="16" x2="22" y1="9" y2="15" />
        </>
      ) : (
        <>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </>
      )}
    </svg>
  );
}

export default function PropertyGallery({
  images,
  video,
  title,
}: {
  images: string[];
  video?: string | null;
  title: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpenIndex(null), []);

  useEffect(() => {
    if (openIndex === null) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") {
        setOpenIndex((i) => (i === null ? i : Math.min(i + 1, images.length - 1)));
      }
      if (e.key === "ArrowLeft") {
        setOpenIndex((i) => (i === null ? i : Math.max(i - 1, 0)));
      }
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, close, images.length]);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === videoWrapRef.current);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  if (images.length === 0 && !video) return null;

  const imageSlots = video ? 3 : 4;
  const visible = images.slice(0, imageSlots);
  const extra = images.length - imageSlots;

  function toggleVideo() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
    } else {
      el.pause();
    }
  }

  function toggleMute() {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  }

  function toggleFullscreen() {
    const wrap = videoWrapRef.current;
    if (!wrap) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void wrap.requestFullscreen();
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {video && (
          <div
            ref={videoWrapRef}
            className={`group relative overflow-hidden bg-black ${
              isFullscreen
                ? "flex items-center justify-center"
                : "aspect-4/5 rounded-xl border border-zinc-200"
            }`}
          >
            <video
              ref={videoRef}
              src={video}
              playsInline
              preload="metadata"
              onClick={toggleVideo}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
              className={`h-full w-full ${
                isFullscreen ? "object-contain" : "object-cover"
              }`}
            />
            <button
              type="button"
              onClick={toggleVideo}
              aria-label={playing ? "Pause video" : "Play video"}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-opacity ${
                  playing
                    ? "bg-black/50 opacity-0 group-hover:opacity-100"
                    : "bg-blue-600/90"
                }`}
              >
                {playing ? <PauseIcon /> : <PlayIcon />}
              </span>
            </button>
            <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Video
            </span>
            <div className="absolute bottom-2 right-2 z-10 flex gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                aria-label={muted ? "Unmute" : "Mute"}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-black/60 text-white transition-colors hover:bg-black/80"
              >
                <SpeakerIcon muted={muted} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-black/60 text-white transition-colors hover:bg-black/80"
              >
                <FullscreenIcon />
              </button>
            </div>
          </div>
        )}

        {visible.map((src, index) => {
          const isLast = index === imageSlots - 1 && extra > 0;
          return (
            <button
              key={src}
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group relative aspect-4/5 overflow-hidden rounded-xl border border-zinc-200"
              aria-label={
                isLast
                  ? `View all ${images.length} images`
                  : `View image ${index + 1}`
              }
            >
              <Image
                src={src}
                alt={`${title} — image ${index + 1}`}
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                  isLast ? "scale-110 blur-sm" : ""
                }`}
              />
              {isLast && (
                <span className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white">
                  <span className="text-lg font-bold">+{extra}</span>
                  <span className="text-sm font-medium">View More</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>

          {openIndex > 0 && (
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex((i) => (i === null ? i : Math.max(i - 1, 0)));
              }}
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[openIndex]}
            alt={`${title} — image ${openIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85dvh] max-w-full rounded-lg object-contain"
          />

          {openIndex < images.length - 1 && (
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex((i) =>
                  i === null ? i : Math.min(i + 1, images.length - 1),
                );
              }}
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          )}

          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
            {openIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}
