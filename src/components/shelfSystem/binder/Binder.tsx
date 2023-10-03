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

import styles from "./Binder.module.css";
import { createSignal, createEffect, onMount, onCleanup } from "solid-js";
import {
  CardArtFetcher,
  SmallCardFetcher,
} from "../../../fetchers/ScryfallAPIFetcher";
import { useStackDraggingContext } from "../../../context/StackDraggingContext";
import { useBinderStateContext } from "../../../context/BinderStateContext";
import { useStackStateContext } from "../../../context/StackStateContext";
import { useStackMapContext } from "~/context/StackMapContext";
import { useNavigate } from "solid-start";

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
  binderName: string;
  binderNum: number;
  binderParentElement: any;
  binderChildType: string;
}

interface binderOutput {
  outputName: string;
  outputType: string;
}

//Main function
export default function Binder({
  displayArt,
  bgCards,
  title,
  binderName,
  binderNum,
  binderParentElement,
  binderChildType,
}: BinderInputs) {
  //Context States
  const [
    binderState,
    { setSelectedBinder, setHoveredBinder, setWaitingToLoad },
  ]: any = useBinderStateContext();
  const [stackState, { changeActiveStack, loadStack }]: any =
    useStackStateContext();
  const [stackMap]: any = useStackMapContext();
  const [stackDragging, { dragToStill }]: any = useStackDraggingContext();

  //State
  const [displayArtUrl, setDisplayArtUrl] = createSignal<string | null>(null);
  const [bgCardUrls, setBgCardUrls] = createSignal<any>([]);
  const [bgCardsLoaded, setBgCardsLoaded] = createSignal<boolean>(false);
  const [binderActive, setBinderActive] = createSignal<boolean>(false);
  const [binderVisible, setBinderVisible] = createSignal<boolean>(false);
  const [binderAnimating, setBinderAnimating] = createSignal<boolean>(true);
  const [thisBinderSelected, setThisBinderSelected] = createSignal<
    true | false | "waiting"
  >(false);
  const [parentActive, setParentActive] = createSignal<boolean>(true);
  const linkTo = useNavigate();

  //Ref Variables
  let binderContainer: HTMLDivElement | null = null;
  let thisBinder: HTMLDivElement | null = null;

  //BgCard styling Variables
  let bgCardArray: any[] = [];
  let bgCardPositions: string[] = ["translate(-50%, -50%)"];
  let bgCardRotation: number = 0;
  let bgCardSize: number = 65;
  let binderOutput: binderOutput = {
    outputName: "nothingHereYet_none",
    outputType: binderChildType,
  };

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

    // //load binder's output
    const stackFromBinder = stackMap().stackList.filter(
      (stackToLoad: any) => stackToLoad.name === binderName
    );

    if (stackFromBinder.length === 1) {
      const nameToLoad = stackFromBinder[0].name;
      const typeToLoad = binderChildType;
      binderOutput = { outputName: nameToLoad, outputType: typeToLoad };
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
    let loadStackRunning: boolean = false;
    function loadStackFromBinder() {
      let timer: number = 2000;
      loadStackRunning = true;
      function loop() {
        if (
          binderState().waitingToLoad &&
          stackDragging() !== "locked" &&
          binderState().selectedBinder === binderNum
        ) {
          setWaitingToLoad(false);
          if (binderOutput.outputType === "newStack") {
            loadStack(binderOutput.outputName);
          } else if (binderOutput.outputType === "cardList") {
            linkTo(`/cardLists/${binderOutput.outputName}`);
          } else {
            console.log("endpoint");
          }
        } else {
          if (timer > 0) {
            timer = timer - 1;
            setTimeout(loop, 1);
          } else console.log("loopEnded");
        }
      }
      loop();
    }
    if (stackDragging() === "still" && parentActive()) {
      setSelectedBinder(binderNum);
      if (!loadStackRunning) loadStackFromBinder();
    }
  };

  //HANDLE BINDER VISUALS

  createEffect(() => {
    if (stackState().activeStack === binderParentElement) {
      setParentActive(true);
    } else {
      setParentActive(false);
    }
  });

  createEffect(() => {
    if (binderState().selectedBinder > 0 && parentActive()) {
      if (binderState().selectedBinder === binderNum) {
        setThisBinderSelected(true);
      } else {
        setThisBinderSelected(false);
      }
    }
  });

  createEffect(() => {
    if (!binderAnimating()) {
      if (parentActive() && binderState().selectedBinder === 0) {
        setBinderVisible(true);
      } else if (thisBinderSelected() !== false) {
        setBinderVisible(true);
      } else {
        setBinderVisible(false);
      }
    }
  });

  createEffect(() => {
    if (parentActive()) {
      setThisBinderSelected(false);
    }
  });

  createEffect(() => {
    if (parentActive()) {
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
      parentActive() &&
      stackDragging() === "dragging" &&
      thisBinderSelected()
    ) {
      setThisBinderSelected(false);
    }
  });

  return (
    <>
      <div
        class={styles.binderContainer}
        ref={(el) => (binderContainer = el)}
        onfocusin={() => {
          setBinderActive(true);
        }}
        onFocusOut={() => {
          setBinderActive(false);
        }}
        onmouseenter={() => {
          if (parentActive()) {
            setHoveredBinder(binderNum);
          }
        }}
        onmouseleave={() => {
          if (parentActive()) {
            setHoveredBinder(0);
          }
        }}
        onclick={() => {}}
        style={{
          opacity: binderVisible() ? "100%" : binderAnimating() ? "0%" : "50%",
        }}
      >
        <div
          tabindex={binderActive() ? "-1" : "0"}
          ref={(el) => (thisBinder = el)}
          class={`${styles.binder} ${
            binderActive() ? styles.binderActive : ""
          }`}
        >
          <div class={styles.binderBox}>
            <div
              class={`${styles.binderImage} ${
                binderActive() ? styles.binderImageActive : ""
              }`}
              style={{
                "background-image": displayArtUrl()
                  ? `url(${displayArtUrl()})`
                  : "none",
              }}
            ></div>
            <div class={styles.overlay}></div>
            <div class={styles.binderTitle}>{title}</div>
            <a class={styles.link}></a>
          </div>

          <div class={styles.popUpContainer}>
            {bgCardsLoaded() &&
              bgCardUrls().map((card: any, index: number) => {
                return (
                  <div
                    class={styles.popUpCard}
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
