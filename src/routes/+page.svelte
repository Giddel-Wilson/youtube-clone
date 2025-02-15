<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { 
    Menu, Search, Home, Library, History, Clock, ThumbsUp, Youtube, 
    ChevronDown, ChevronUp, Bell, User, Compass, PlaySquare, Film, 
    Plus, Users, ArrowLeft, X, Mic, Radio, Trophy, Settings, 
    Flag, HelpCircle, MessageSquare, ChevronRight
  } from "lucide-svelte";
  import { fly } from "svelte/transition";
  import VideoCard from "$lib/components/VideoCard.svelte";
  import ShortsCard from "$lib/components/ShortsCard.svelte";
  import { searchVideos, getTrendingVideos, getShorts } from "$lib/utils/youtube";
  import type { YouTubeVideo } from "$lib/utils/youtube";
  import { onMount } from "svelte";
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import youTube from '$lib/assets/ytLogo.png';
  
  let sidebarOpen = false;
  let sidebarCollapsed = false;
  let searchQuery = "";
  let videos: YouTubeVideo[] = [];
  let trendingVideos: YouTubeVideo[] = [];
  let shorts: YouTubeVideo[] = [];
  let loading = true;
  let isSearchResults = false;
  let showAllShorts = false;
  let showMobileSearch = false;
  let isMobile = false;
  let searchHistory: string[] = [
    "JavaScript tutorial",
    "Svelte tutorial",
    "React vs Svelte",
    "Web development tips",
    "Coding best practices"
  ];

  $: visibleShorts = shorts.slice(0, showAllShorts ? shorts.length : isMobile ? 4 : 6);
  //$: recommendedRestSection = trendingVideos.slice(8);

  function getVideoId(video: YouTubeVideo): string {
    return typeof video.id === 'string' ? video.id : video.id.videoId;
  }

  function navigateToVideo(id: string) {
    goto(`/watch/${id}`);
  }

  onMount(() => {
    if (browser) {
      const loadContent = async () => {
        try {
          console.log('Fetching initial content...');
          const [trendingResponse, shortsResponse] = await Promise.all([
            getTrendingVideos(),
            getShorts()
          ]);
          
          console.log('API Responses:', {
            trending: trendingResponse,
            shorts: shortsResponse
          });

          if (!trendingResponse?.items?.length) {
            console.error('No trending videos received');
            throw new Error('No trending videos available');
          }

          trendingVideos = trendingResponse.items;
          shorts = shortsResponse.items || [];

          console.log('Processed videos:', {
            trending: trendingVideos.length,
            shorts: shorts.length
          });
        } catch (err) {
          console.error('Error loading content:', err);
          trendingVideos = [];
          shorts = [];
        } finally {
          loading = false;
        }
      };

      loadContent();
      checkMobile();
      
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  });

  // Define interface for menu items
  interface MenuItem {
    icon: typeof import('lucide-svelte').Icon;
    label: string;
    showCollapsed?: boolean;
    class?: string;
  }

  interface MenuSection {
    section: string;
    title?: string;
    items: MenuItem[];
  }

  const menuItems: MenuSection[] = [
    { section: 'main', items: [
      { icon: Home, label: 'Home', showCollapsed: true },
      { icon: Compass, label: 'Explore', showCollapsed: true },
      { icon: PlaySquare, label: 'Subscriptions', showCollapsed: true },
      { icon: Library, label: 'Library', showCollapsed: true },
      { icon: History, label: 'History' },
      { icon: Clock, label: 'Watch Later' },
      { icon: ThumbsUp, label: 'Liked videos' }
    ]},
    { section: 'subscriptions', title: 'Subscriptions', items: [
      { icon: Users, label: 'Browse channels', showCollapsed: false }
    ]},
    { section: 'explore', title: 'Explore', items: [
      { icon: Film, label: 'Movies & TV' },
      { icon: Radio, label: 'Live' },
      { icon: Trophy, label: 'Sports' }
    ]},
    { section: 'more', title: 'More from YouTube', items: [
      { icon: PlaySquare, label: 'YouTube Studio' },
      { icon: Radio, label: 'YouTube Music' },
      { icon: User, label: 'YouTube Kids' }
    ]},
    { section: 'settings', title: 'Settings', items: [
      { icon: Settings, label: 'Settings' },
      { icon: Flag, label: 'Report history' },
      { icon: HelpCircle, label: 'Help' },
      { icon: MessageSquare, label: 'Send feedback' }
    ]}
  ];

  const bottomItems: MenuItem[] = [
    { icon: Film, label: 'Downloads', showCollapsed: true, class: '' },
    { icon: User, label: 'Your channel', showCollapsed: true, class: '' }
  ];

  import type { SpeechRecognitionImpl, SpeechRecognitionEvent } from '$lib/types/speech';

  let recognition: SpeechRecognitionImpl | null = null;
  let isListening = false;

  function startVoiceSearch() {
    if (!recognition) return;
    
    isListening = true;
    recognition.start();
  }

  function stopVoiceSearch() {
    if (!recognition) return;
    
    isListening = false;
    recognition.stop();
  }

  if (typeof window !== 'undefined') {
    const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionImpl) {
      recognition = new SpeechRecognitionImpl();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[0][0].transcript;
        searchQuery = result;
        handleSearch();
      };

      recognition.onend = () => {
        isListening = false;
      };
    }
  }

  // Check if mobile on mount and window resize
  function checkMobile() {
    if (browser) {
      isMobile = window.innerWidth < 768;
    }
  }

  const toggleSidebar = () => {
    if (isMobile) {
      sidebarOpen = !sidebarOpen;
    } else {
      sidebarCollapsed = !sidebarCollapsed;
    }
  };

  const toggleShorts = () => {
    showAllShorts = !showAllShorts;
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    loading = true;
    isSearchResults = true;
    showMobileSearch = false;
    
    try {
      const response = await searchVideos(searchQuery);
      videos = response.items;
      if (!searchHistory.includes(searchQuery)) {
        searchHistory = [searchQuery, ...searchHistory.slice(0, 4)];
      }
    } catch (err) {
      console.error('Error searching videos:', err);
      videos = [];
    }
    loading = false;
  };

  const handleSearchHistoryClick = (query: string) => {
    searchQuery = query;
    handleSearch();
  };

  const toggleMobileSearch = () => {
    showMobileSearch = !showMobileSearch;
    if (!showMobileSearch) {
      searchQuery = "";
    }
  };

  const clearSearchQuery = () => {
    searchQuery = "";
  };

  // Add a new array for shorts data
  let shortsData = [
    { id: 'short1', title: 'Funny Cat Moments', views: '1.2M', duration: '0:30', videoUrl: 'https://www.youtube.com/shorts/XyNlqQId-nk' },
    { id: 'short2', title: 'Amazing Magic Trick', views: '500K', duration: '0:15', videoUrl: 'https://www.youtube.com/shorts/Z8RWpfhB0eU' },
    { id: 'short3', title: 'Quick Cooking Tip', views: '750K', duration: '0:45', videoUrl: 'https://www.youtube.com/shorts/PUP7U5vTMM0' },
    { id: 'short4', title: 'Incredible Skateboard Trick', views: '2M', duration: '0:20', videoUrl: 'https://www.youtube.com/shorts/hkBKAa-I0U0' },
    { id: 'short5', title: 'Cute Puppy Compilation', views: '3.5M', duration: '1:00', videoUrl: 'https://www.youtube.com/shorts/AZ2ZPmEfjvU' },
    { id: 'short6', title: 'Life Hack: Folding Clothes', views: '900K', duration: '0:40', videoUrl: 'https://www.youtube.com/shorts/uz6rjbw0ZA0' },
  ];

  // Function to handle clicking on a short
  function handleShortClick(videoUrl: string) {
    window.open(videoUrl, '_blank');
  }

  function chunkArray(array: any[], size: number) {
    return Array.from({ length: Math.ceil(array.length / size) }, (v, i) =>
      array.slice(i * size, i * size + size)
    );
  }

  $: videoChunks = chunkArray(trendingVideos, 4);
</script>

<style lang="postcss">
  :global(input[type="search"]::-webkit-search-cancel-button) {
    -webkit-appearance: none;
  }

  :global(.thin-scrollbar::-webkit-scrollbar) {
    width: 8px;
  }

  :global(.thin-scrollbar::-webkit-scrollbar-track) {
    background: transparent;
  }

  :global(.thin-scrollbar::-webkit-scrollbar-thumb) {
    background-color: #888;
    border-radius: 4px;
  }

  :global(.thin-scrollbar::-webkit-scrollbar-thumb:hover) {
    background-color: #555;
  }
</style>

<div class="min-h-screen bg-background dark:bg-[#0f0f0f]">
  <!-- Mobile Search Overlay -->
  {#if showMobileSearch}
    <div class="fixed inset-0 bg-white dark:bg-[#0f0f0f] z-[60]">
      <div class="flex items-center gap-2 p-2 border-b">
        <Button 
          variant="ghost" 
          size="icon" 
          class="hover:bg-gray-100 dark:hover:bg-gray-800"
          on:click={toggleMobileSearch}
        >
          <ArrowLeft class="h-5 w-5" />
        </Button>
        <div class="flex-1">
          <form class="flex" on:submit={(e) => {
            e.preventDefault();
            handleSearch();
          }}>
            <div class="flex-1 relative">
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
            <Button 
              type="submit"
              variant="outline" 
              class="rounded-r-full border border-l-0 px-6 hover:bg-secondary/80 h-[40px]"
            >
              <Search class="h-5 w-5" />
            </Button>
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              class="mic-button rounded-full ml-2 h-[40px] w-[40px] {isListening ? 'listening' : ''}"
              on:click={() => {
                if (isListening) {
                  stopVoiceSearch();
                } else {
                  startVoiceSearch();
                }
              }}
              aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
            >
              <Mic class="h-5 w-5 relative z-10" />
            </Button>
          </form>
        </div>
      </div>

      <!-- Search History -->
      <div class="p-2">
        {#if searchQuery && searchQuery.length > 0}
          <!-- Search Suggestions -->
          <div class="space-y-1">
            {#each searchHistory.filter(h => h.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5) as suggestion}
              <button
                class="flex items-center gap-3 w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                on:click={() => handleSearchHistoryClick(suggestion)}
              >
                <Search class="h-4 w-4 text-muted-foreground" />
                <span class="flex-1 text-left">{suggestion}</span>
                <ArrowLeft class="h-4 w-4 text-muted-foreground rotate-[135deg]" />
              </button>
            {/each}
          </div>
        {:else}
          <!-- Recent Searches -->
          <div class="space-y-1">
            {#each searchHistory as history}
              <div class="flex items-center gap-3 w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group relative">
                <button
                  class="flex items-center gap-3 flex-1"
                  on:click={() => handleSearchHistoryClick(history)}
                >
                  <Clock class="h-4 w-4 text-muted-foreground" />
                  <span class="text-left">{history}</span>
                </button>
                <button
                  class="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  on:click={() => {
                    searchHistory = searchHistory.filter(h => h !== history);
                  }}
                  aria-label="Remove from history"
                >
                  <X class="h-full w-full" />
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Header -->
  <header class="flex items-center justify-between px-4 h-14 bg-white dark:bg-[#0f0f0f] border-b fixed top-0 left-0 right-0 z-50">
    <div class="flex items-center gap-4">
      <Button 
        variant="ghost" 
        size="icon" 
        class="hidden md:flex -ml-2"
        on:click={toggleSidebar}
      >
        <Menu class="h-5 w-5" />
      </Button>
      <a href="/" class="flex items-center">
        <img src={youTube || "/placeholder.svg"} alt="YouTube" class="h-5" />
      </a>
    </div>
    <div class="hidden md:flex flex-1 justify-center max-w-[600px]">
      <form class="flex w-[584px]" on:submit={(e) => {
        e.preventDefault();
        handleSearch();
      }}>
        <div class="relative flex-1">
          <Input 
            type="search" 
            placeholder="Search" 
            class="rounded-l-full border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0 pl-4 h-full"
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
        <Button 
          type="submit"
          variant="outline" 
          class="rounded-r-full border border-l-0 px-6 hover:bg-secondary/80 h-[40px]"
        >
          <Search class="h-5 w-5" />
        </Button>
        <Button 
          type="button"
          variant="ghost" 
          size="icon" 
          class="mic-button rounded-full ml-1 h-[40px] w-[40px] {isListening ? 'listening' : ''}"
          on:click={() => {
            if (isListening) {
              stopVoiceSearch();
            } else {
              startVoiceSearch();
            }
          }}
          on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (isListening) {
                stopVoiceSearch();
              } else {
                startVoiceSearch();
              }
            }
          }}
          aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
        >
          <Mic class="h-6 w-6 relative z-10" />
        </Button>
      </form>
    </div>
    <div class="flex items-center gap-4 pr-2">
      <Button 
        variant="ghost" 
        size="icon" 
        class="rounded-full hidden md:flex"
      >
        <Bell class="h-6 w-6" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        class="rounded-full hidden md:flex h-8 w-8 p-0"
      >
        <img 
          src="https://i.pinimg.com/236x/57/d9/f0/57d9f011dffce04a5af02cef4a81f551.jpg?enhanced" 
          alt="User" 
          class="h-full w-full rounded-full object-cover" 
        />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        class="rounded-full flex md:hidden"
        on:click={toggleMobileSearch}
      >
        <Search class="h-6 w-6" />
      </Button>
    </div>
  </header>

  <!-- Sidebar -->
  {#if sidebarOpen}
    <button
      type="button"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      on:click={toggleSidebar}
      on:keydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleSidebar();
        }
      }}
      aria-label="Close sidebar overlay"
    ></button>
  {/if}
  
  <!-- Mobile Sidebar -->
  {#if sidebarOpen}
    <aside
      class="fixed top-14 left-0 bottom-0 w-60 bg-white dark:bg-[#0f0f0f] border-r z-50 lg:hidden overflow-y-auto"
      transition:fly={{ x: -100, duration: 200 }}
    >
      <nav class="py-3">
        {#each menuItems as section}
          {#if !sidebarCollapsed && section.title}
            <div class="px-3 pt-4 pb-1">
              <h3 class="text-sm text-muted-foreground font-medium">{section.title}</h3>
            </div>
          {/if}
          
          <div class="px-2">
            {#each section.items as item}
              <div class="py-1">
                <Button 
                  variant="ghost" 
                  class="w-full rounded-lg {sidebarCollapsed ? 
                    'flex-col py-4 h-auto px-1' : 
                    'flex h-10 hover:bg-secondary/80'
                  } {section.section === 'main' && item.label === 'Home' ? 'bg-secondary/80' : ''}"
                >
                  {#if sidebarCollapsed}
                    <svelte:component 
                      this={item.icon} 
                      class="h-6 w-6 mb-1 {section.section === 'more' ? 'text-red-600' : ''}"
                    />
                    <span class="text-[10px]">{item.label}</span>
                  {:else}
                    <div class="flex items-center w-full px-3">
                      <div class="flex-shrink-0 w-6">
                        <svelte:component 
                          this={item.icon} 
                          class="h-6 w-6 {section.section === 'more' ? 'text-red-600' : ''}"
                        />
                      </div>
                      <span class="text-[14px] ml-4 {section.section === 'main' && item.label === 'Home' ? 'font-medium' : ''}">{item.label}</span>
                    </div>
                  {/if}
                </Button>
              </div>
            {/each}
          </div>

          {#if !sidebarCollapsed && section.section !== 'more'}
            <hr class="my-3 mx-3 border-gray-200 dark:border-gray-700" />
          {/if}
        {/each}
      </nav>

      {#if !sidebarCollapsed}
        <div class="px-4 py-3 text-xs text-muted-foreground">
          <p class="mb-3">About Press Copyright Contact us Creators Advertise Developers</p>
          <p class="mb-3">Terms Privacy Policy & Safety How YouTube works Test new features</p>
          <p> 2025 Giddel Clone</p>
        </div>
      {/if}
    </aside>
  {/if}

  <!-- Desktop Sidebar -->
  <aside class="bg-white dark:bg-[#0f0f0f] border-r flex-col hidden md:flex fixed top-14 bottom-0 left-0 overflow-y-auto transition-all duration-300 {sidebarCollapsed ? 'w-[90px]' : 'w-60'} thin-scrollbar">
    <nav class="py-2 flex flex-col h-full">
      <div class="flex flex-col flex-1">
        {#each menuItems as section}
          {#if !sidebarCollapsed && section.title}
            <div class="px-3 pt-4 pb-1">
              <h2 class="text-sm text-muted-foreground">{section.title}</h2>
            </div>
          {/if}
          
          {#each section.items as item}
            {#if sidebarCollapsed ? item.showCollapsed : true}
              <div class="px-2 py-1">
                <Button 
                  variant="ghost" 
                  class="w-full rounded-lg {sidebarCollapsed ? 
                    'flex-col py-4 h-auto px-1' : 
                    'flex h-10 hover:bg-secondary/80'
                  }"
                >
                  {#if sidebarCollapsed}
                    <svelte:component 
                      this={item.icon} 
                      class="h-6 w-6 mb-1 {item.class || ''}"
                    />
                    <span class="text-[10px]">{item.label}</span>
                  {:else}
                    <div class="flex items-center w-full px-3">
                      <svelte:component 
                        this={item.icon} 
                        class="h-6 w-6 {item.class || ''}"
                      />
                      <span class="text-[14px] ml-6">{item.label}</span>
                    </div>
                  {/if}
                </Button>
              </div>
            {/if}
          {/each}
          
          {#if !sidebarCollapsed && section.title}
            <div class="px-3 py-2">
              <hr class="border-gray-200 dark:border-gray-700" />
            </div>
          {/if}
        {/each}
      </div>

      <!-- Bottom Items -->
      {#if sidebarCollapsed}
        <div class="mt-auto pb-4">
          {#each bottomItems as item}
            <div class="px-2 py-1">
              <Button 
                variant="ghost" 
                class="w-full rounded-lg flex-col py-4 h-auto px-1"
              >
                <svelte:component 
                  this={item.icon} 
                  class="h-6 w-6 mb-1 {item.class || ''}"
                />
                <span class="text-[10px]">{item.label}</span>
              </Button>
            </div>
          {/each}
        </div>
      {/if}

      {#if !sidebarCollapsed}
        <div class="px-3 py-3 text-[13px] text-muted-foreground border-t mt-auto">
          <p class="mb-3">About Press Copyright Contact us Creators Advertise Developers</p>
          <p class="mb-3">Terms Privacy Policy & Safety How YouTube works Test new features</p>
          <p class="text-[12px] text-muted-foreground/70"> 2025 Giddel Clone</p>
        </div>
      {/if}
    </nav>
  </aside>

  <!-- Main Content -->
  <main class="flex-1 overflow-y-auto pt-14 pb-16 md:pb-0 transition-all duration-300 {sidebarCollapsed ? 'md:ml-[90px]' : 'md:ml-60'}">
    <div class="p-4 md:p-6">
      {#if loading}
        <!-- Loading Skeleton -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {#each Array(8) as _}
            <div class="animate-pulse">
              <div class="aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl mb-4"></div>
              <div class="flex gap-3">
                <div class="flex-shrink-0 w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                <div class="flex-1">
                  <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else if isSearchResults}
        <!-- Search Results -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {#each videos as video (getVideoId(video))}
            <button
              class="group w-full text-left"
              on:click={() => navigateToVideo(getVideoId(video))}
              on:keydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigateToVideo(getVideoId(video));
                }
              }}
              aria-label={`Watch ${video.snippet.title}`}
            >
              <VideoCard {video} />
            </button>
          {/each}
        </div>
      {:else}
        <!-- Categories -->
        <div class="flex gap-3 mb-6 overflow-x-auto pb-2 thin-scrollbar">
          {#each ['All', 'Music', 'Gaming', 'News', 'Live', 'Sports', 'Learning', 'Fashion'] as category}
            <button class="px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm whitespace-nowrap">
              {category}
            </button>
          {/each}
        </div>

        <!-- Shorts Section -->
        <section class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <svg viewBox="0 0 24 24" class="w-6 h-6 mr-2 text-red-600 fill-current">
                <path d="M17.77 10.32c-.77-.32-1.2-.5-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25zM10 14.65v-5.3L15 12l-5 2.65z"/>
              </svg>
              <h2 class="text-lg font-semibold">Shorts</h2>
            </div>
            <Button variant="ghost" size="sm" class="text-blue-600">
              View all
              <ChevronRight class="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {#each shortsData as short (short.id)}
              <button
                class="group w-full text-left"
                on:click={() => handleShortClick(short.videoUrl)}
              >
                <div class="relative aspect-[9/16] mb-2">
                  <img src={`https://i.ytimg.com/vi/${short.videoUrl.split('/').pop()}/hqdefault.jpg`} alt={short.title} class="object-cover w-full h-full rounded-xl" />
                  <div class="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                    {short.duration}
                  </div>
                </div>
                <h3 class="text-sm font-medium line-clamp-2">{short.title}</h3>
                <p class="text-xs text-muted-foreground">{short.views} views</p>
              </button>
            {/each}
          </div>
        </section>

        <!-- Recommended Videos -->
        {#each videoChunks as chunk, index}
          <section class="mb-8">
            {#if index === 0}
              <h2 class="text-lg font-semibold mb-4">Recommended Videos</h2>
            {/if}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {#each chunk as video (getVideoId(video))}
                <button
                  class="group w-full text-left"
                  on:click={() => navigateToVideo(getVideoId(video))}
                  on:keydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigateToVideo(getVideoId(video));
                    }
                  }}
                  aria-label={`Watch ${video.snippet.title}`}
                >
                  <VideoCard {video} />
                </button>
              {/each}
            </div>
          </section>
        {/each}
      {/if}
    </div>
  </main>

  <!-- Mobile Bottom Navigation -->
  <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0f0f0f] border-t z-50">
    <div class="flex justify-around items-center">
      <a href="/" class="flex-1">
        <Button 
          variant="ghost"           class="w-full flex flex-col items-center gap-1 h-auto py-2 px-3 hover:bg-transparent"
        >
          <Home class="h-6 w-6" />
          <span class="text-[10px]">Home</span>
        </Button>
      </a>
      <Button 
        variant="ghost" 
        class="flex-1 flex flex-col items-center gap-1 h-auto py-2 px-3 hover:bg-transparent"
      >
        <Youtube class="h-6 w-6" />
        <span class="text-[10px]">Shorts</span>
      </Button>
      <Button 
        variant="ghost" 
        class="flex-1 flex flex-col items-center gap-1 h-auto py-2 px-3 hover:bg-transparent"
      >
        <Plus class="h-6 w-6" />
        <span class="text-[10px]">Create</span>
      </Button>
      <Button 
        variant="ghost" 
        class="flex-1 flex flex-col items-center gap-1 h-auto py-2 px-3 hover:bg-transparent"
      >
        <Users class="h-6 w-6" />
        <span class="text-[10px]">Subscriptions</span>
      </Button>
      <Button 
        variant="ghost" 
        class="flex-1 flex flex-col items-center gap-1 h-auto py-2 px-3 hover:bg-transparent"
      >
        <User class="h-6 w-6" />
        <span class="text-[10px]">You</span>
      </Button>
    </div>
  </nav>

  <!-- Search History -->
  {#if showMobileSearch && searchHistory.length > 0}
    <div class="fixed inset-0 bg-background dark:bg-[#0f0f0f] z-[60]">
      <div class="flex items-center gap-2 p-2 border-b">
        <button 
          class="p-2 hover:bg-secondary/80 rounded-full"
          on:click={() => showMobileSearch = false}
          on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              showMobileSearch = false;
            }
          }}
        >
          <ArrowLeft class="h-6 w-6" />
        </button>
        <div class="flex-1">
          <Input
            type="search"
            placeholder="Search YouTube"
            class="w-full"
            bind:value={searchQuery}
          />
        </div>
      </div>
      <div class="p-4">
        <h3 class="text-sm font-medium mb-2">Recent searches</h3>
        {#each searchHistory as search}
          <button
            class="flex items-center gap-3 w-full p-3 hover:bg-secondary/80 rounded-lg"
            on:click={() => {
              searchQuery = search;
              handleSearch();
            }}
            on:keydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                searchQuery = search;
                handleSearch();
              }
            }}
          >
            <History class="h-5 w-5" />
            <span>{search}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>