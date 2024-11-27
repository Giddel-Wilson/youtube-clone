<script lang="ts">
  import type { Video } from '$lib/types/youtube';
  import { Youtube } from 'lucide-svelte';
  
  export let video: Video;
  
  // Ensure video ID is properly typed
  const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
</script>

<a href="/watch/{videoId}" class="group">
  <div class="relative overflow-hidden bg-muted rounded-xl" style="aspect-ratio: 9/16;">
    <img
      src={video.snippet.thumbnails.medium.url}
      alt={video.snippet.title}
      class="w-full h-full object-cover"
      loading="lazy"
    />
    <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
    <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
      <h3 class="text-white font-medium line-clamp-2 text-sm">
        {video.snippet.title}
      </h3>
      <p class="text-white/80 text-xs mt-1">
        {video.snippet.channelTitle}
      </p>
    </div>
  </div>
</a>

<style>
</style>
