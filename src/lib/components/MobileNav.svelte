<script lang="ts">
  import { Home, Library, History, Clock, ThumbsUp, Youtube, Users, Film, Radio, Trophy, User, Compass, PlaySquare } from "lucide-svelte";
  import { page } from '$app/stores';

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Compass, label: 'Explore', href: '/explore' },
    { icon: PlaySquare, label: 'Subscriptions', href: '/subscriptions' },
    { icon: Clock, label: 'Watch Later', href: '/watch-later' },
    { icon: Film, label: 'Downloads', href: '/downloads', mobileOnly: true },
    { icon: User, label: 'You', href: '/you', mobileOnly: true }
  ];

  $: currentPath = $page.url.pathname;
</script>

<nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0f0f0f] border-t z-50">
  <div class="flex justify-between items-stretch h-14">
    {#each navItems as item}
      <a 
        href={item.href}
        class="flex flex-col items-center justify-center flex-1 py-1 px-1 text-muted-foreground hover:text-foreground transition-colors"
        class:text-foreground={currentPath === item.href}
      >
        <svelte:component this={item.icon} class="h-6 w-6 mb-1" />
        <span class="text-[10px]">{item.label}</span>
      </a>
    {/each}
  </div>
</nav>
