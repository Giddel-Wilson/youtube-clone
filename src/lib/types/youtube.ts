export interface VideoId {
  kind: string;
  videoId: string;
}

export interface Video {
  kind: string;
  etag: string;
  id: string | VideoId;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: Thumbnail;
      medium: Thumbnail;
      high: Thumbnail;
    };
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
}

export interface VideoDetails extends Omit<Video, 'id'> {
  id: string;
  statistics: {
    viewCount: string;
    likeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
}

interface Thumbnail {
  url: string;
  width: number;
  height: number;
}
