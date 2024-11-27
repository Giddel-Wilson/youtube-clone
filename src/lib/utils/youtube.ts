import { PUBLIC_YOUTUBE_API_KEY } from '$env/static/public';

const API_KEY = PUBLIC_YOUTUBE_API_KEY;
const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Validate API key on module load
console.log('YouTube API Key status:', {
  present: !!API_KEY,
  length: API_KEY?.length ?? 0
});

if (!API_KEY) {
  console.error('YouTube API key is missing! Make sure PUBLIC_YOUTUBE_API_KEY is set in your .env file');
}

export interface VideoId {
  kind: string;
  videoId: string;
}

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface Thumbnails {
  default: Thumbnail;
  medium: Thumbnail;
  high: Thumbnail;
}

export interface VideoSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: Thumbnails;
  channelTitle: string;
  liveBroadcastContent: string;
  publishTime: string;
}

export interface Video {
  kind: string;
  etag: string;
  id: string | VideoId;
  snippet: VideoSnippet;
  contentDetails?: {
    duration: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    dislikeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
}

export type YouTubeVideo = Video;

export interface YouTubeVideoItem {
  kind: string;
  etag: string;
  id: string | VideoId;
  snippet: VideoSnippet;
  contentDetails?: {
    duration: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    dislikeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
}

export interface YouTubeApiResponse {
  kind: string;
  etag: string;
  items: YouTubeVideoItem[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  nextPageToken?: string;
}

async function handleYouTubeResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json();
    console.error('YouTube API Error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    });
    throw new Error(`YouTube API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function searchVideos(query: string): Promise<YouTubeApiResponse> {
  const response = await fetch(
    `${API_BASE_URL}/search?part=snippet&maxResults=50&q=${encodeURIComponent(
      query
    )}&type=video&key=${API_KEY}`
  );
  return handleYouTubeResponse<YouTubeApiResponse>(response);
}

export async function getVideoDetails(videoId: string): Promise<Video> {
  const response = await fetch(
    `${API_BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${API_KEY}`
  );
  const data = await handleYouTubeResponse<YouTubeApiResponse>(response);
  return data.items[0];
}

export async function getRelatedVideos(videoId: string): Promise<YouTubeApiResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/search?part=snippet&relatedToVideoId=${videoId}&type=video&key=${API_KEY}`
    );
    return handleYouTubeResponse<YouTubeApiResponse>(response);
  } catch (error) {
    console.error('Error fetching related videos:', error);
    return {
      kind: 'youtube#searchListResponse',
      etag: '',
      items: [],
      pageInfo: {
        totalResults: 0,
        resultsPerPage: 0
      }
    };
  }
}

export async function getTrendingVideos(regionCode = 'US', videoCategoryId = '0'): Promise<YouTubeApiResponse> {
  try {
    if (!API_KEY) {
      throw new Error('YouTube API key is missing');
    }

    console.log('Fetching trending videos with API key:', API_KEY ? 'Present' : 'Missing');
    const url = `${API_BASE_URL}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=${regionCode}&videoCategoryId=${videoCategoryId}&maxResults=50&key=${API_KEY}`;
    console.log('Trending videos URL:', url);

    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`YouTube API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Trending videos response:', data);

    if (!data.items || !Array.isArray(data.items)) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from YouTube API');
    }

    return {
      kind: data.kind,
      etag: data.etag,
      items: data.items.map((item: YouTubeVideoItem) => ({
        ...item,
        id: item.id
      })),
      pageInfo: data.pageInfo,
      nextPageToken: data.nextPageToken
    };
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    return {
      kind: 'youtube#videoListResponse',
      etag: '',
      items: [],
      pageInfo: {
        totalResults: 0,
        resultsPerPage: 0
      }
    };
  }
}

export async function getShorts(): Promise<YouTubeApiResponse> {
  try {
    console.log('Fetching shorts with API key:', API_KEY ? 'Present' : 'Missing');
    const url = `${API_BASE_URL}/search?part=snippet,contentDetails&type=video&videoDuration=short&maxResults=50&key=${API_KEY}`;
    console.log('Shorts URL:', url);
    const response = await fetch(url);
    const data = await handleYouTubeResponse<YouTubeApiResponse>(response);
    console.log('Shorts response:', data);
    return {
      kind: data.kind,
      etag: data.etag,
      items: data.items.map((item: YouTubeVideoItem) => ({
        ...item,
        id: item.id
      })),
      pageInfo: data.pageInfo,
      nextPageToken: data.nextPageToken
    };
  } catch (error) {
    console.error('Error fetching shorts:', error);
    return {
      kind: 'youtube#searchListResponse',
      etag: '',
      items: [],
      pageInfo: {
        totalResults: 0,
        resultsPerPage: 0
      }
    };
  }
}
