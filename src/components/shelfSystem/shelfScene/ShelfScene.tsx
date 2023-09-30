import styles from "./shelfSceneStyles.module.css";
import Stack from "../stack/Stack";
import {
  createSignal,
  createEffect,
  onMount,
  For,
  Switch,
  Match,
  onCleanup,
} from "solid-js";
import { useStackStateContext } from "../../../context/StackStateContext";
import { useBinderStateContext } from "../../../context/BinderStateContext";
import { useStackDraggingContext } from "../../../context/StackDraggingContext";
import BackButton from "../backButton/BackButton";
import { useStackMapContext } from "../../../context/StackMapContext";
import buildStackMap from "./buildStackMap";

export default function ShelfScene() {
  let shelfHeight: number;
  let shelfSceneContainer: HTMLDivElement | null = null;
  const [stackList, setStackList] = createSignal<any[]>([]);
  const [stackState, { loadStack, closeXStacks, addToStackCount }]: any =
    useStackStateContext();
  const [binderState, { setHoveredBinder, setSelectedBinder }]: any =
    useBinderStateContext();
  const [stackDragging, { dragToStill }]: any = useStackDraggingContext();
  const [stackMap, { makeStackMap }]: any = useStackMapContext();

  onMount(() => {
    buildStackMap();

    setStackList((prevList) => [
      ...prevList,
      <Stack stackID="starting_none" stackNum={stackState().stackCount} />,
    ]);

    setMargins();
  });

  // createEffect(() => {
  //   console.log(stackState().stackCount);
  // });

  function setMargins() {
    setTimeout(() => {
      if (shelfSceneContainer) {
        shelfHeight =
          shelfSceneContainer.children[0].getBoundingClientRect().height;
        const topMarginCalc: number = (window.innerHeight - shelfHeight) / 2;
        shelfSceneContainer.style.paddingTop = `${topMarginCalc}px`;
        shelfSceneContainer.style.paddingBottom = `${topMarginCalc}px`;
      }
    }, 1);
  }

  function newShelf(path: string) {
    if (stackState.loadingStack !== "none") {
      loadStack("none");
      addToStackCount(1);
      setStackList((prevList) => [
        ...prevList,
        () => {
          return (
            <Stack stackID={`${path}`} stackNum={stackState().stackCount} />
          );
        },
      ]);
    }
  }

  function closeStacks(inputNumber: number) {
    let scrolling: boolean = true;
    let scrollingCheck: any;

    function manageScrolling() {
      clearTimeout(scrollingCheck);
      scrollingCheck = setTimeout(() => {
        scrolling = false;
        if (shelfSceneContainer) {
          shelfSceneContainer.style.transition = "padding 0.05s";
          shelfSceneContainer.style.paddingBottom = `${currentBottomMargin}px`;
        }
        window.removeEventListener("scroll", manageScrolling);
      }, 1);
    }

    setTimeout(() => {
      window.addEventListener("scroll", manageScrolling);
    }, 200);

    const currentBottomMargin = parseInt(
      shelfSceneContainer?.style.paddingBottom as string
    );

    if (shelfSceneContainer) {
      shelfSceneContainer.style.transition = "padding 0s";
      shelfSceneContainer.style.paddingBottom = `${
        currentBottomMargin + shelfHeight
      }px`;
    }

    const newShelfArray = stackList().slice(0, -inputNumber);
    addToStackCount(-inputNumber);
    closeXStacks(0);
    setStackList(newShelfArray);
    dragToStill();
  }

  createEffect(() => {
    if (stackState().stacksToClose > 0) {
      const countLessHovered =
        stackState().stackCount - stackState().hoveredStack;
      const adjustedStackCount = (() => {
        if (countLessHovered > 0) {
          return countLessHovered;
        } else {
          return 1;
        }
      })();
      closeStacks(adjustedStackCount);
    }
  });

  createEffect(() => {
    if (stackState().loadingStack !== "none") {
      newShelf(stackState().loadingStack);
    }
  });

  return (
    <div
      class={styles.shelfSceneContainer}
      ref={(el) => (shelfSceneContainer = el)}
      onclick={() => {}}
    >
      <For
        each={stackList()}
        fallback={<div class={styles.loadingStacksText}></div>}
      >
        {(stack) => <div class={styles.stackSlider}>{stack()}</div>}
      </For>
      <Switch fallback={<></>}>
        <Match when={stackState().stackCount > 1}>
          <BackButton />
        </Match>
      </Switch>
    </div>
  );
}
