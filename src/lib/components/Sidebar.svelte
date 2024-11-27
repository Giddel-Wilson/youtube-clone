<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Home, Library, History, Clock, ThumbsUp, Youtube, Users, Film, Radio, Trophy, User, Compass, PlaySquare } from "lucide-svelte";

  export let sidebarCollapsed: boolean;

  interface MenuItem {
    icon: any;
    label: string;
    showCollapsed?: boolean;
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
      { icon: Library, label: 'Library', showCollapsed: false },
      { icon: History, label: 'History', showCollapsed: false },
      { icon: Clock, label: 'Watch Later', showCollapsed: true }
    ]},
    { section: 'subscriptions', title: 'Subscriptions', items: [
      { icon: Users, label: 'Browse channels', showCollapsed: false }
    ]},
    { section: 'explore', title: 'Explore', items: [
      { icon: Film, label: 'Movies & TV', showCollapsed: false },
      { icon: Radio, label: 'Live', showCollapsed: false },
      { icon: Trophy, label: 'Sports', showCollapsed: false }
    ]},
    { section: 'more', title: 'More from YouTube', items: [
      { icon: Youtube, label: 'YouTube Premium', showCollapsed: false }
    ]}
  ];

  const bottomItems = [
    { icon: Film, label: 'Downloads', collapsedOnly: true },
    { icon: User, label: 'You', collapsedOnly: true }
  ];
</script>

<!-- Desktop Sidebar -->
<aside class="bg-white dark:bg-[#0f0f0f] border-r flex-col hidden md:flex fixed top-14 bottom-0 left-0 overflow-y-auto transition-all duration-300 {sidebarCollapsed ? 'w-[90px] px-2' : 'w-60 px-4'} thin-scrollbar">
  <nav class="py-2 flex flex-col h-full">
    {#each menuItems as section}
      {#if !sidebarCollapsed && section.title}
        <div class="pt-4 pb-2 px-2">
          <h3 class="text-base text-muted-foreground">{section.title}</h3>
        </div>
      {/if}
      
      {#each section.items as item}
        {#if !sidebarCollapsed || item.showCollapsed}
          <div class="py-1">
            <Button 
              variant="ghost" 
              class="w-full rounded-lg {sidebarCollapsed ? 
                'flex-col py-4 h-auto px-1' : 
                'flex h-10 hover:bg-secondary/80'
              } {section.section === 'main' && item.label === 'Home' ? 'bg-secondary/80' : ''}"
              href={item.label.toLowerCase() === 'home' ? '/' : `/${item.label.toLowerCase().replace(/\s+/g, '-')}`}
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
        {/if}
      {/each}

      {#if !sidebarCollapsed && section.section !== 'more'}
        <div class="py-2 px-2">
          <hr class="border-gray-200 dark:border-gray-700" />
        </div>
      {/if}
    {/each}

    <!-- Bottom Items -->
    {#if sidebarCollapsed}
      <div class="mt-auto py-2">
        {#each bottomItems as item}
          <div class="py-1">
            <Button 
              variant="ghost" 
              class="w-full rounded-lg flex-col py-4 h-auto px-1"
            >
              <svelte:component 
                this={item.icon} 
                class="h-6 w-6 mb-1"
              />
              <span class="text-[10px]">{item.label}</span>
            </Button>
          </div>
        {/each}
      </div>
    {/if}
  </nav>

  {#if !sidebarCollapsed}
    <div class="py-3 px-6 text-[13px] text-muted-foreground">
      <p class="mb-3">About Press Copyright Contact us Creators Advertise Developers</p>
      <p class="mb-3">Terms Privacy Policy & Safety How YouTube works Test new features</p>
      <p class="text-[12px] text-muted-foreground/70"> 2023 Google LLC</p>
    </div>
  {/if}
</aside>
