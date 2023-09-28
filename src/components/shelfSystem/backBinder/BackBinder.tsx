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

import styles from "./BackBinder.module.css";
import { createSignal, createEffect, onMount, onCleanup } from "solid-js";

import { useStackDraggingContext } from "../../../context/StackDraggingContext";
import { useBinderStateContext } from "../../../context/BinderStateContext";
import { useStackStateContext } from "../../../context/StackStateContext";

interface BinderInputs {
  binderNum: number;
  binderParentElement: any;
}

//Main function
export default function Binder({
  binderNum,
  binderParentElement,
}: BinderInputs) {
  //Empty styling properties for bgCards

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
      // queueStackFromBinder();
    }
  });

  // const queueStackFromBinder = () => {
  //   if (stackState().queuedStack === "none") {
  //     if (binderChildType === "newStack") {
  //       queueStack(`${binderName}`);
  //     } else if (binderChildType === "cardList") {
  //       console.log("Route to card list");
  //     }
  //   } else {
  //     queueStack(`nothingHereYet_none`);
  //   }
  // };

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
            <a class={styles.link}></a>
          </div>
        </div>
      </div>
    </>
  );
}
