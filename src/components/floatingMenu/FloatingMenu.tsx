import './fmStyle.css';
import {
  createEffect,
  createSignal,
  onCleanup,
  Switch,
  Match,
  onMount,
} from 'solid-js';

// Establish Types
type MenuStates = 'default' | 'searchOpen' | 'bookmarkOpen';
type ScreenSizes = 'Desktop' | 'LaptopTablet' | 'Mobile';

//Establish States
export const [menuState, setMenuState] = createSignal<MenuStates>('default');
export const [screenSize, setScreenSize] = createSignal('Desktop');

//Solid-Ref definitions for typescript
//Homebutton
let homeButton: HTMLAnchorElement;
let homeTitle: HTMLDivElement;
let initTitleWidth = () => window.getComputedStyle(homeTitle).width;
//Searchbar
let searchBar: HTMLDivElement;
let searchBarInput: HTMLInputElement;
let searchCloseButton: HTMLButtonElement;
//BookmarkBar
let bookmarkBar: HTMLAnchorElement;
let bookmarkCloseButton: HTMLButtonElement;
//Accountbutton
let accountButton: HTMLAnchorElement;

//Converts screen width to screensize

export function getScreenSize(width: number): ScreenSizes {
  if (width >= 1025) {
    return 'Desktop';
  } else if (width >= 481) {
    return 'LaptopTablet';
  } else {
    return 'Mobile';
  }
}

//Styling Adjust Functions
//Home Button
const openHome = () => {
  homeButton.style.width = `calc((var(--MenuHeight) * 1.2) + ${initTitleWidth()})`;
  homeButton.style.gridTemplateColumns = 'var(--MenuHeight) 1fr';
};

const closeHome = () => {
  homeButton.style.width = 'var(--MenuHeight)';
  homeButton.style.gridTemplateColumns = 'var(--MenuHeight) 0';
};

//Search Bar
const openSearch = () => {
  searchBar.style.width =
    'calc(var(--MenuHeight) * 2.2 + var(--SearchBarWidth))';
  searchBar.style.gridTemplateColumns =
    'var(--MenuHeight) 1fr var(--MenuHeight)';

  searchBarInput.style.cursor = 'text';
  searchCloseButton.style.display = 'grid';
};
const closeSearch = () => {
  searchBar.style.width = 'var(--MenuHeight)';
  searchBar.style.gridTemplateColumns = 'var(--MenuHeight) 0 0';
  searchCloseButton.style.display = 'none';
};

//Bookmark Bar
const openBookmark = () => {
  bookmarkBar.style.width =
    'calc(var(--MenuHeight) * 2.2 + var(--BookmarkBarWidth))';
  bookmarkBar.style.gridTemplateColumns =
    'var(--MenuHeight) 1fr var(--MenuHeight)';
  bookmarkCloseButton.style.display = 'grid';
};
const closeBookmark = () => {
  bookmarkBar.style.width = 'var(--MenuHeight)';
  bookmarkBar.style.gridTemplateColumns = 'var(--MenuHeight) 0 0';
  bookmarkCloseButton.style.display = 'none';
};

//Home button Component

function FMHome() {
  return (
    <>
      <div classList={{ menuItemContainer: true }}>
        <a
          href="/"
          tabIndex="0"
          classList={{
            button: true,
          }}
          ref={homeButton}
          onFocusIn={() => {
            setMenuState('default');
          }}
        >
          <div id="FMHomeIcon"></div>
          <div style={'display: flex'}>
            <div classList={{ fmHomeTitle: true }} ref={homeTitle}>
              Sylvan Archive
            </div>
          </div>
        </a>
      </div>
    </>
  );
}

//Searchbar Component

function FMSearch() {
  const [searchTabIndex, setSearchTabIndex] = createSignal(0);
  const [inputTabIndex, setInputTabIndex] = createSignal(-1);

  //Triggers opening animation in mobile layout
  onMount(() => {
    closeSearch();
    setTimeout(() => {
      if (menuState() === 'searchOpen') {
        openSearch();
      }
    }, 1);
  });

  return (
    <>
      <div classList={{ menuItemContainer: true }}>
        <div
          ref={searchBar}
          classList={{ button: true }}
          tabindex={searchTabIndex()}
          onfocus={() => {
            setSearchTabIndex(-1);
            setInputTabIndex(0);
            searchBarInput.select();
            setMenuState('searchOpen');
          }}
        >
          <div id="FMSearchIcon"></div>
          <input
            ref={searchBarInput}
            tabIndex={inputTabIndex()}
            id="searchInput"
            value="Start searching"
            type="text"
            onfocusout={() => {
              setSearchTabIndex(0);
              setInputTabIndex(-1);
            }}
          />
          <button
            id="searchCloseButton"
            ref={searchCloseButton}
            onclick={() => setMenuState('default')}
          >
            <div></div>
            <div></div>
          </button>
        </div>
      </div>
    </>
  );
}

//Bookmark Bar Component

function FMBookmark() {
  //Triggers opening animation in mobile layout
  onMount(() => {
    closeBookmark();
    setTimeout(() => {
      if (menuState() === 'bookmarkOpen') {
        openBookmark();
      }
    }, 1);
  });
  return (
    <>
      <div classList={{ menuItemContainer: true }}>
        <a
          ref={bookmarkBar}
          classList={{ button: true }}
          tabIndex="0"
          onFocusIn={() => {
            setMenuState('bookmarkOpen');
          }}
        >
          <div id="FMBookmarkIcon"></div>
          <div classList={{ fmHomeTitle: true }}>Bookmarks</div>
          <button
            id="bookmarkCloseButton"
            ref={bookmarkCloseButton}
            onclick={() => setMenuState('default')}
          >
            <div></div>
            <div></div>
          </button>
        </a>
      </div>
    </>
  );
}

//Account button component

function FMAccount() {
  return (
    <>
      <div classList={{ menuItemContainer: true }}>
        <a
          ref={accountButton}
          href="/Account"
          classList={{ button: true }}
          tabIndex="0"
          onFocusIn={() => {
            setMenuState('default');
          }}
        >
          <div id="FMAccountIcon"></div>
        </a>
      </div>
    </>
  );
}

//Full menu component

export default function FloatingMenu() {
  //Set initial screensize
  onMount(() => {
    setScreenSize(getScreenSize(window.innerWidth));
  });

  //Track screen size changes
  createEffect(() => {
    const handleScreenSize = () => {
      setScreenSize(getScreenSize(window.innerWidth));
    };

    window.addEventListener('resize', handleScreenSize);

    onCleanup(() => {
      window.removeEventListener('resize', handleScreenSize);
    });
  });

  // Set menuState to "default" whenever user scrolls or window is resized
  function StateCheck() {
    //Setter function
    const updateDefault = () => {
      setMenuState('default');
      //Update home button visual on mobile/scroll
      if (screenSize() === 'Mobile' || window.scrollY > 0) {
        closeHome();
      } else {
        openHome();
      }
      //Unfocus menu items
      homeButton.blur();
      searchBar.blur();
      searchBarInput.blur();
      bookmarkBar.blur();
      accountButton.blur();
    };

    createEffect(() => {
      window.addEventListener('resize', updateDefault);

      onCleanup(() => {
        window.removeEventListener('resize', updateDefault);
      });
    });

    createEffect(() => {
      window.addEventListener('scroll', updateDefault);
      onCleanup(() => {
        window.removeEventListener('scroll', updateDefault);
      });
    });
  }

  StateCheck();

  //Visual switching based on menuState

  createEffect(() => {
    if (menuState() === 'searchOpen') {
      closeHome();
      openSearch();
      closeBookmark();
    } else if (menuState() === 'bookmarkOpen') {
      closeHome();
      closeSearch();
      openBookmark();
    } else if (screenSize() === 'Mobile' || window.scrollY > 0) {
      closeHome();
      closeSearch();
      closeBookmark();
    } else {
      openHome();
      closeSearch();
      closeBookmark();
    }
  });

  //Switch function hides components
  return (
    <>
      <Switch
        fallback={
          <div class="floatingMenuContainer">
            <FMHome />
            <FMSearch />
            <FMBookmark />
            <FMAccount />
          </div>
        }
      >
        <Match when={screenSize() === 'Mobile' && menuState() === 'searchOpen'}>
          <div class="floatingMenuContainer">
            <FMSearch />
          </div>
        </Match>
        <Match
          when={screenSize() === 'Mobile' && menuState() === 'bookmarkOpen'}
        >
          <div class="floatingMenuContainer">
            <FMBookmark />
          </div>
        </Match>
      </Switch>
    </>
  );
}
