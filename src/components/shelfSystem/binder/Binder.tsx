//Binder is the component that visually an functionally links from
//the current grouping to a sub grouping or card list
//when defining the object it will need a minimum of:
// - link - a link to th page it represents
// - title - A title for that page displays on the card
// - display art - uses the art fetcher so it will require a minimum of a cardname
//but can take other identifiers
// - bg cards - can take up to three cards as bg cards it will adjust styling
// base on how many are passed to it, these also use the art fetcher and require a
// minimum of a card name for each

import "./binderStyles.css";
import { createSignal, createEffect, onMount, onCleanup } from "solid-js";
import {
  CardArtFetcher,
  SmallCardFetcher,
} from "../../../fetchers/ScryfallAPIFetcher";
import { useStackDraggingContext } from "../../../context/StackDraggingContext";
import { useBinderStateContext } from "../../../context/BinderStateContext";
import { useStackStateContext } from "../../../context/StackStateContext";

//TYPING
interface CardFetcherInputs {
  art: string;
  artSet?: string;
  artNum?: number;
  artFace?: "front" | "back";
}
interface BinderInputs {
  displayArt: CardFetcherInputs;
  bgCards?: CardFetcherInputs[];
  title: string;
  binderNum: number;
  binderParentElement: any;
  binderLink: string;
}

//Main function
export default function Binder({
  displayArt,
  bgCards,
  title,
  binderNum,
  binderParentElement,
  binderLink,
}: BinderInputs) {
  //Empty styling properties for bgCards
  let bgCardArray: any[] = [];
  let bgCardPositions: string[] = ["translate(-50%, -50%)"];
  let bgCardRotation: number = 0;
  let bgCardSize: number = 65;

  //State to asynchronously pass elements card art/images
  const [displayArtUrl, setDisplayArtUrl] = createSignal<string | null>(null);
  const [bgCardUrls, setBgCardUrls] = createSignal<any>([]);
  const [bgCardsLoaded, setBgCardsLoaded] = createSignal<boolean>(false);
  //State to handle all visual edits to binder when it is "active"
  const [binderActive, setBinderActive] = createSignal<boolean>(false);
  const [binderVisible, setBinderVisible] = createSignal<boolean>(false);
  //Shelf contexts
  const [binderState, { setSelectedBinder, setHoveredBinder }]: any =
    useBinderStateContext();
  const [stackState, { changeActiveStack, queueStack }]: any =
    useStackStateContext();
  const [stackDragging]: any = useStackDraggingContext();
  const [thisBinderSelected, setThisBinderSelected] = createSignal<
    true | false | "waiting"
  >(false);
  const [binderAnimating, setBinderAnimating] = createSignal<boolean>(true);

  //Define Unique HTML Elements ro reference
  let binderContainer: HTMLDivElement | null = null;
  let thisBinder: HTMLDivElement | null = null;
  //Define Empty functions to define on mount
  let handleHover: Function;
  let handleHoverOut: Function;

  //Inputs primary display art
  createEffect(async () => {
    const url = await CardArtFetcher(displayArt.art, {
      cardSet: displayArt?.artSet,
      cardCollectNum: displayArt?.artNum,
      cardFace: displayArt?.artFace,
    });
    setDisplayArtUrl(url);
  });

  //Inputs background card urls art into an array that can be mapped in the return
  createEffect(async () => {
    if (bgCards) {
      bgCardArray = await Promise.all(
        bgCards.map(async (card) => {
          let cardInfo: string;
          let mapCardSet: any;
          let mapCardCollectNum: any;
          let mapCardFace: any;
          if (typeof card === "string") {
            cardInfo = card;
          } else {
            cardInfo = card.art;
            mapCardSet = card.artSet;
            mapCardCollectNum = card.artNum;
            mapCardFace = card.artFace;
          }

          return await SmallCardFetcher(cardInfo, {
            cardSet: `${mapCardSet}`,
            cardCollectNum: mapCardCollectNum,
            cardFace: mapCardFace,
          });
        })
      );
      setBgCardUrls(bgCardArray);
      setBgCardsLoaded(true);
    }
  });

  createEffect(() => {
    if (binderState().hoveredBinder > 0 && bgCardUrls().length === 0) {
      setBgCardUrls(bgCardArray);
    }
  });

  //Conditionally sets styling based on the number of Background Cards to be displayed
  createEffect(() => {
    if (bgCardUrls().length > 2) {
      bgCardRotation = 20;
      bgCardSize = 75;
      bgCardPositions[1] = `translate(-65%, -88%) rotate(-${bgCardRotation}deg)`;
      bgCardPositions[2] = `translate(-50%, -90%) rotate(-1deg)`;
      bgCardPositions[3] = `translate(-35%, -87%) rotate(${bgCardRotation}deg)`;
    } else if (bgCardUrls().length === 2) {
      bgCardRotation = 15;
      bgCardSize = 78;
      bgCardPositions[1] = `translate(-65%, -86%) rotate(-${bgCardRotation}deg)`;
      bgCardPositions[2] = `translate(-35%, -84%) rotate(${bgCardRotation}deg)`;
    } else if (bgCardUrls().length === 1) {
      bgCardRotation = 0;
      bgCardSize = 85;
      bgCardPositions[1] = `translate(-50%, -80%) rotate(-${bgCardRotation}deg)`;
    }
  });

  onMount(() => {
    if (binderContainer) {
      binderContainer.addEventListener("dblclick", handleDoubleClick);
    }

    //fade in animation
    const stackContainer = binderParentElement.children;
    const binderCount = stackContainer[0].children.length;

    function fadeIn() {
      let centerBinder: number[];
      let binderDistance: number;
      centerBinder = [Math.ceil(binderCount / 2)];
      binderDistance = centerBinder[0] - binderNum;
      if (binderDistance < 0) {
        binderDistance = Math.abs(binderDistance) + 0.5;
      }
      const timeToFadeIn: number = binderDistance * 100;
      setTimeout(() => {
        setBinderVisible(true);
        setBinderAnimating(false);
      }, timeToFadeIn);
    }
    fadeIn();
  });

  const handleDoubleClick = (event: MouseEvent) => {
    if (stackDragging() === "still") {
      setSelectedBinder(binderNum);
    }
  };

  //HANDLE BINDER VISUALS
  createEffect(() => {
    if (
      binderState().selectedBinder > 0 &&
      stackState().activeStack === binderParentElement
    ) {
      if (binderState().selectedBinder === binderNum) {
        setThisBinderSelected(true);
      } else {
        setThisBinderSelected(false);
      }
    }
  });

  createEffect(() => {
    if (!binderAnimating()) {
      if (
        stackState().activeStack === binderParentElement &&
        binderState().selectedBinder === 0
      ) {
        setBinderVisible(true);
      } else if (thisBinderSelected() !== false) {
        setBinderVisible(true);
      } else {
        setBinderVisible(false);
      }
    }
  });

  createEffect(() => {
    if (stackState().activeStack === binderParentElement) {
      setThisBinderSelected(false);
    }
  });

  createEffect(() => {
    if (stackState().activeStack === binderParentElement) {
      if (
        binderState().hoveredBinder === binderNum &&
        binderState().selectedBinder === 0
      ) {
        setBinderActive(true);
      } else if (thisBinderSelected() !== false) {
        setBinderActive(true);
      } else {
        setBinderActive(false);
      }
    }
  });

  createEffect(() => {
    if (
      stackState().activeStack === binderParentElement &&
      stackDragging() === "dragging" &&
      thisBinderSelected()
    ) {
      setThisBinderSelected(false);
    }
  });

  createEffect(() => {
    if (
      stackDragging() === "locked" &&
      binderState().selectedBinder === binderNum
    ) {
      queueStackFromBinder();
    }
  });

  const queueStackFromBinder = () => {
    if (stackState().queuedStack === "none") {
      queueStack(`${binderLink}`);
    }
  };

  return (
    <>
      <div
        class="binderContainer"
        ref={(el) => (binderContainer = el)}
        onfocusin={() => {
          setBinderActive(true);
        }}
        onFocusOut={() => {
          setBinderActive(false);
        }}
        onmouseenter={() => {
          if (stackState().activeStack === binderParentElement) {
            setHoveredBinder(binderNum);
          }
        }}
        onmouseleave={() => {
          if (stackState().activeStack === binderParentElement) {
            setHoveredBinder(0);
          }
        }}
        style={{
          opacity: binderVisible() ? "100%" : binderAnimating() ? "0%" : "50%",
        }}
      >
        <div
          tabindex="0"
          ref={(el) => (thisBinder = el)}
          classList={{
            binder: true,
            binderActive: binderActive(),
          }}
        >
          <div class="binderBox">
            <div
              classList={{
                binderImage: true,
                binderImageActive: binderActive(),
              }}
              style={{
                "background-image": displayArtUrl()
                  ? `url(${displayArtUrl()})`
                  : "none",
              }}
            ></div>
            <div class="overlay"></div>
            <div class="binderTitle">{title}</div>
            <a class="link"></a>
          </div>

          <div class="popUpContainer">
            {bgCardsLoaded() &&
              bgCardUrls().map((card: any, index: number) => {
                return (
                  <div
                    class="popUpCard"
                    style={{
                      "background-image": card ? `url(${card})` : "none",
                      transform: binderActive()
                        ? bgCardPositions[index + 1]
                        : bgCardPositions[0],
                      width: binderActive() ? `${bgCardSize}%` : `$50%`,
                      height: binderActive() ? `${bgCardSize}%` : `$50%`,
                    }}
                  ></div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
}
