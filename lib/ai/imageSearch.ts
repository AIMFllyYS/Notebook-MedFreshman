const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY || "";
const UNSPLASH_API_URL = "https://api.unsplash.com/search/photos";

export interface ImageSearchResult {
  url: string;
  thumbnail: string;
  author: string;
  source: string;
  alt: string;
  downloadLocation: string;
}

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
  };
  links: {
    html: string;
    download_location: string;
  };
  alt_description: string | null;
  width: number;
  height: number;
}

export async function searchImages(
  query: string,
  numResults = 3,
): Promise<ImageSearchResult[]> {
  if (!UNSPLASH_KEY || !query.trim()) return [];

  try {
    const enhancedQuery = enhanceQueryForEducation(query);
    const res = await fetch(
      `${UNSPLASH_API_URL}?query=${encodeURIComponent(enhancedQuery)}&per_page=${numResults * 2}&content_filter=high`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_KEY}`,
          "Accept-Version": "v1",
        },
      },
    );

    if (!res.ok) return [];

    const data = await res.json();
    const candidates: UnsplashPhoto[] = data.results ?? [];

    return selectBestImages(candidates, numResults);
  } catch {
    return [];
  }
}

function enhanceQueryForEducation(query: string): string {
  const lower = query.toLowerCase();
  const educationKeywords = [
    "diagram",
    "illustration",
    "educational",
    "academic",
    "chart",
    "graph",
    "experiment",
    "physics",
    "chemistry",
    "mathematics",
    "probability",
    "statistics",
  ];

  if (educationKeywords.some((kw) => lower.includes(kw))) {
    return query;
  }

  return `${query} diagram illustration`;
}

function selectBestImages(
  candidates: UnsplashPhoto[],
  count: number,
): ImageSearchResult[] {
  return candidates
    .sort((a, b) => {
      const sizeA = a.width * a.height;
      const sizeB = b.width * b.height;
      return sizeB - sizeA;
    })
    .slice(0, count)
    .map((photo) => ({
      url: photo.urls.regular,
      thumbnail: photo.urls.thumb,
      author: photo.user.name,
      source: photo.links.html,
      alt: photo.alt_description || "Unsplash photo",
      downloadLocation: photo.links.download_location,
    }));
}

export async function trackPhotoDownload(
  downloadLocation: string,
): Promise<void> {
  if (!downloadLocation || !UNSPLASH_KEY) return;

  try {
    await fetch(downloadLocation, {
      headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
    });
  } catch {
    // Silent failure
  }
}
