/**
 * Parses a YouTube or Vimeo URL and returns a safe embed URL.
 * Returns null for invalid or unsupported URLs.
 */
export function parseVideoEmbedUrl(url: string): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace('www.', '');

    // YouTube: youtube.com/watch?v=ID or youtu.be/ID or youtube.com/embed/ID
    if (host === 'youtube.com' || host === 'youtu.be') {
      let videoId: string | null = null;

      if (host === 'youtu.be') {
        videoId = parsed.pathname.slice(1);
      } else if (parsed.pathname === '/watch') {
        videoId = parsed.searchParams.get('v');
      } else if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.replace('/embed/', '');
      }

      if (videoId && /^[\w-]{11}$/.test(videoId)) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // Vimeo: vimeo.com/ID or player.vimeo.com/video/ID
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      let videoId: string | null = null;

      if (host === 'player.vimeo.com') {
        videoId = parsed.pathname.replace('/video/', '');
      } else {
        videoId = parsed.pathname.slice(1);
      }

      if (videoId && /^\d+$/.test(videoId)) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }
  } catch {
    // Invalid URL
  }

  return null;
}
