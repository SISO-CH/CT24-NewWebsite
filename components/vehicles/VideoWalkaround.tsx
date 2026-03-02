// components/vehicles/VideoWalkaround.tsx

interface Props {
  url: string;
}

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

export default function VideoWalkaround({ url }: Props) {
  const embedUrl = getEmbedUrl(url);
  if (!embedUrl) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-ct-dark">Video-Walkaround</h2>
      <div className="relative aspect-video rounded-xl overflow-hidden bg-ct-dark">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Fahrzeug-Video"
        />
      </div>
    </div>
  );
}
