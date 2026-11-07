import { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVideoUrl?: string | null;
  videoUrl?: string | null;
}

export function extractVideoId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|(?:youtube\.com|youtube-nocookie\.com)\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}

export default function VideoModal({
  isOpen,
  onClose,
  currentVideoUrl,
  videoUrl,
}: VideoModalProps) {
  const rawUrl = currentVideoUrl || videoUrl || '';
  const videoId = extractVideoId(rawUrl);

  // Use youtube-nocookie with strict-origin-when-cross-origin to avoid ERR_CONNECTION_CLOSED
  const embedUrl = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`
    : rawUrl;

  const directUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : rawUrl;

  // Escape key handler & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Conditional iframe: Render ONLY when modal is open and has URL
  if (!isOpen || !rawUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Watch demo video"
    >
      {/* Dark backdrop: rgba(10,10,12,0.8) with backdrop-blur-sm */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#0A0A0C]/80 backdrop-blur-sm cursor-pointer"
        aria-hidden="true"
      />

      {/* Centered Modal Frame with Top-Right Close Button */}
      <div className="relative z-10 w-full max-w-[min(90vw,calc(80vh*9/16))] flex flex-col items-center justify-center">
        {/* "X" close button at top right */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close demo video"
          className="absolute -top-11 right-0 sm:-right-9 z-20 size-9 rounded-full bg-[#0A0A0C]/80 hover:bg-[#FF5A1F] text-white border border-white/10 flex items-center justify-center transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]"
        >
          <X size={18} />
        </button>

        {/* Conditional 9:16 responsive vertical iframe */}
        <iframe
          src={embedUrl}
          title="Project Demo Video"
          className="w-full aspect-[9/16] max-h-[75vh] sm:max-h-[80vh] rounded-xl border border-white/10 bg-black shadow-2xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />

        {/* Direct link & fallback */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 w-full px-1">
          <span className="font-mono text-[11px] text-[var(--text-faint)]">
            Can't see video?
          </span>
          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF5A1F]/15 hover:bg-[#FF5A1F]/25 text-[#FF5A1F] border border-[#FF5A1F]/30 font-mono text-xs font-medium transition-all"
          >
            <span>Watch directly on YouTube</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
