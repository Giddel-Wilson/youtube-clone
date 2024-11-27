<script lang="ts">
  import type { Video } from '$lib/types/youtube';
  import { formatDistanceToNow } from 'date-fns';
  
  export let video: Video;
  
  $: formattedDate = formatDistanceToNow(new Date(video.snippet.publishedAt), { addSuffix: true });
  
  // Handle both search/related videos (video.id.videoId) and trending videos (video.id)
  $: videoId = typeof video.id === 'string' ? video.id : video.id.videoId;

  function formatViews(viewCount: number) {
    if (viewCount >= 1000000) {
      return `${(viewCount / 1000000).toFixed(1)}M views`;
    } else if (viewCount >= 1000) {
      return `${(viewCount / 1000).toFixed(1)}K views`;
    }
    return `${viewCount} views`;
  }
</script>

<a href="/watch/{videoId}" class="group">
  <div class="aspect-video rounded-xl overflow-hidden bg-muted">
    <img
      src={video.snippet.thumbnails.medium.url}
      alt={video.snippet.title}
      class="w-full h-full object-cover transition-all group-hover:scale-105"
    />
  </div>
  <div class="mt-3 flex gap-3">
    <div class="flex-shrink-0">
      <div class="w-9 h-9 rounded-full bg-muted overflow-hidden">
        <!-- Channel avatar would go here if available in the API -->
        <div class="w-full h-full bg-accent flex items-center justify-center">
          <span class="text-sm font-medium">
            {video.snippet.channelTitle[0].toUpperCase()}
          </span>
        </div>
      </div>
    </div>
    <div class="flex-1">
      <h3 class="font-medium line-clamp-2 text-sm leading-5 mb-1">
        {video.snippet.title}
      </h3>
      <div class="text-sm text-muted-foreground space-y-0.5">
        <p>{video.snippet.channelTitle}</p>
        <p class="flex items-center gap-1">
          <span>{formattedDate}</span>
        </p>
      </div>
    </div>
  </div>
</a>
