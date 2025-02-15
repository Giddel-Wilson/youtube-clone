<script lang="ts">
  import { page } from "$app/stores";
  import { getVideoDetails, getRelatedVideos } from "$lib/utils/youtube";
  import type { YouTubeVideo, YouTubeApiResponse } from "$lib/utils/youtube";
  import { onMount } from "svelte";
  import VideoCard from "$lib/components/VideoCard.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import MobileNav from "$lib/components/MobileNav.svelte";
  import { formatDistanceToNow } from "date-fns";
  import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, Menu, Search, Bell, User, X, Mic, ArrowLeft } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import youTube from "$lib/assets/ytLogo.png";
  import { browser } from "$app/environment";
  import { goto } from '$app/navigation';

  let video: YouTubeVideo | null = null;
  let relatedVideos: YouTubeVideo[] = [];
  let loading = true;
  let error: string | null = null;
  let descriptionExpanded = false;
  let searchQuery = "";
  let showMobileSearch = false;
  let isMobile = false;
  let sidebarCollapsed = true;  // Default to collapsed in watch page

  // Check if mobile on mount and window resize
  function checkMobile() {
    if (browser) {
      isMobile = window.innerWidth < 768;
    }
  }

  onMount(() => {
    checkMobile();
    if (browser) {
      window.addEventListener('resize', checkMobile);
    }

    return () => {
      if (browser) {
        window.removeEventListener('resize', checkMobile);
      }
    };
  });

  onMount(async () => {
    try {
      const videoId = $page.params.id;
      video = await getVideoDetails(videoId);
      const relatedResponse = await getRelatedVideos(videoId);
      relatedVideos = relatedResponse.items;
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      loading = false;
    }
  });

  $: videoId = $page.params.id;

  $: formattedDate = video
    ? formatDistanceToNow(new Date(video.snippet.publishedAt), { addSuffix: true })
    : '';

  function formatNumber(num: string | undefined): string {
    if (!num) return '0';
    return new Intl.NumberFormat('en-US').format(parseInt(num));
  }

  function getVideoId(video: YouTubeVideo): string {
    return typeof video.id === 'string' ? video.id : video.id.videoId;
  }

  function toggleMobileSearch() {
    showMobileSearch = !showMobileSearch;
  };

  function clearSearchQuery() {
    searchQuery = "";
  };

  function handleSearch() {
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  function toggleSidebar() {
    sidebarCollapsed = !sidebarCollapsed;
  };
</script>

<!-- Mobile Search Overlay -->
{#if showMobileSearch}
  <div class="fixed inset-0 bg-background dark:bg-[#0f0f0f] z-[60]">
    <div class="flex items-center gap-2 p-2 border-b">
      <Button variant="ghost" size="icon" class="shrink-0" on:click={toggleMobileSearch}>
        <ArrowLeft class="h-6 w-6" />
      </Button>
      <form class="flex-1 flex" on:submit|preventDefault={handleSearch}>
        <div class="relative flex-1">
          <Input 
            type="search" 
            placeholder="Search YouTube" 
            class="rounded-l-full border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0 pl-4 h-9"
            bind:value={searchQuery}
          />
          {#if searchQuery}
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              class="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground h-9 w-9"
              on:click={clearSearchQuery}
            >
              <X class="h-5 w-5" />
            </Button>
          {/if}
        </div>
        <Button 
          type="submit"
          variant="outline" 
          class="rounded-r-full border-l-0 px-6 hover:bg-secondary/80 h-9"
        >
          <Search class="h-5 w-5" />
        </Button>
      </form>
    </div>
  </div>
{/if}

<!-- Header -->
<header class="flex items-center justify-between px-4 h-14 bg-white dark:bg-[#0f0f0f] border-b fixed top-0 left-0 right-0 z-50">
  <div class="flex items-center gap-4">
    <Button variant="ghost" size="icon" class="hidden md:flex -ml-2" on:click={toggleSidebar}>
      <Menu class="h-5 w-5" />
    </Button>
    <a href="/" class="flex items-center">
      <img src={youTube} alt="YouTube" class="h-5" />
    </a>
  </div>
  <div class="hidden md:flex flex-1 justify-center max-w-[600px]">
    <form class="flex w-[584px]" on:submit|preventDefault={handleSearch}>
      <div class="relative flex-1">
        <Input 
          type="search" 
          placeholder="Search" 
          class="rounded-l-full border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0 pl-4"
          bind:value={searchQuery}
        />
        {#if searchQuery}
          <Button 
            type="button"
            variant="ghost" 
            size="icon" 
            class="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            on:click={clearSearchQuery}
          >
            <X class="h-5 w-5" />
          </Button>
        {/if}
      </div>
      <Button type="submit" variant="outline" class="rounded-r-full border-l-0 px-6 hover:bg-secondary/80">
        <Search class="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" class="rounded-full ml-2">
        <Mic class="h-5 w-5" />
      </Button>
    </form>
  </div>
  <div class="flex items-center gap-2">
    <Button variant="ghost" size="icon" class="md:hidden" on:click={toggleMobileSearch}>
      <Search class="h-5 w-5" />
    </Button>
    <Button variant="ghost" size="icon" class="rounded-full">
      <Bell class="h-5 w-5" />
    </Button>
  </div>
</header>

<Sidebar {sidebarCollapsed} />
<MobileNav />

<div class="min-h-screen bg-background dark:bg-[#0f0f0f] pt-14 pb-14 md:pb-0">
  <div class="max-w-[1800px] mx-auto px-4 transition-all duration-300" class:md:pl-[90px]={sidebarCollapsed} class:md:pl-[260px]={!sidebarCollapsed}>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <!-- Video Player -->
        <div class="aspect-video rounded-xl overflow-hidden bg-black -mx-4 md:mx-0">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/{videoId}"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
        
        {#if video}
          <!-- Video Info -->
          <div class="mt-3 md:mt-4 space-y-3 md:space-y-4 px-4 md:px-0">
            <h1 class="text-lg md:text-xl font-semibold leading-tight">
              {video.snippet.title}
            </h1>
            
            <div class="flex flex-wrap items-start md:items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <span class="text-lg font-medium">
                    {video.snippet.channelTitle[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 class="font-medium">{video.snippet.channelTitle}</h3>
                  <p class="text-sm text-muted-foreground">
                    {formatNumber(video.statistics?.viewCount)} subscribers
                  </p>
                </div>
                <Button variant="secondary" class="ml-4 hidden md:flex">Subscribe</Button>
              </div>
              
              <div class="flex items-center gap-2 w-full md:w-auto order-1 md:order-none">
                <Button variant="secondary" class="flex-1 md:flex-none rounded-full">Subscribe</Button>
                <div class="bg-accent rounded-full flex items-center flex-1 md:flex-none">
                  <Button variant="ghost" size="sm" class="rounded-l-full flex-1 md:flex-none">
                    <ThumbsUp class="h-4 w-4 mr-2" />
                    {formatNumber(video.statistics?.likeCount)}
                  </Button>
                  <div class="w-[1px] h-6 bg-border"></div>
                  <Button variant="ghost" size="sm" class="rounded-r-full">
                    <ThumbsDown class="h-4 w-4" />
                  </Button>
                </div>
                
                <Button variant="secondary" size="sm" class="rounded-full hidden md:flex">
                  <Share2 class="h-4 w-4 mr-2" />
                  Share
                </Button>
                
                <Button variant="secondary" size="sm" class="rounded-full hidden md:flex">
                  <Download class="h-4 w-4 mr-2" />
                  Download
                </Button>
                
                <Button variant="ghost" size="icon" class="rounded-full">
                  <MoreHorizontal class="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <!-- Description -->
            <div class="bg-accent/50 rounded-xl p-3 text-sm">
              <div class="flex items-center gap-2 font-medium">
                <span>{formatNumber(video.statistics?.viewCount)} views</span>
                <span>•</span>
                <span>{formattedDate}</span>
              </div>
              <div class={`mt-2 whitespace-pre-wrap ${!descriptionExpanded ? "line-clamp-2" : ""}`}>
                {video.snippet.description}
              </div>
              {#if video.snippet.description.length > 100}
                <button
                  class="mt-2 font-medium"
                  on:click={() => descriptionExpanded = !descriptionExpanded}
                >
                  {descriptionExpanded ? "Show less" : "Show more"}
                </button>
              {/if}
            </div>
          </div>
        {/if}
      </div>
      
      <!-- Related Videos -->
      <div class="space-y-4 px-4 md:px-0">
        {#each relatedVideos as relatedVideo (getVideoId(relatedVideo))}
          <button
            class="video-card w-full hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
            on:click={() => goto(`/watch/${getVideoId(relatedVideo)}`)}
            on:keydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                goto(`/watch/${getVideoId(relatedVideo)}`);
              }
            }}
          >
            <VideoCard video={relatedVideo} />
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>
