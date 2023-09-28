import styles from "./shelfSceneStyles.module.css";
import Stack from "../stack/Stack";
import {
  createSignal,
  createEffect,
  onMount,
  For,
  Switch,
  Match,
} from "solid-js";
import { useStackStateContext } from "../../../context/StackStateContext";
import { useBinderStateContext } from "../../../context/BinderStateContext";
import { useStackDraggingContext } from "../../../context/StackDraggingContext";
import BackButton from "../backButton/BackButton";
import { useStackMapContext } from "../../../context/StackMapContext";
import buildStackMap from "./buildStackMap";

export default function ShelfScene() {
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
    updateStacks();
  });

  function newShelf(path: string) {
    if (stackState().loadingStack !== "none") {
      addToStackCount(1);
      loadStack("none");
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
    const newShelfArray = stackList().slice(0, -inputNumber);
    addToStackCount(-inputNumber);
    closeXStacks(0);
    setStackList(newShelfArray);
    dragToStill();
  }

  const updateStacks = () => {
    function loop() {
      if (stackState().stacksToClose > 0) {
        closeStacks(stackState().stacksToClose);
        setTimeout(loop, 100);
      } else if (stackState().loadingStack !== "none") {
        newShelf(stackState().loadingStack);
        setTimeout(loop, 100);
      } else {
        setTimeout(loop, 100);
      }
    }
    loop();
  };

  return (
    <div class={styles.shelfSceneContainer} onclick={() => {}}>
      <For
        each={stackList()}
        fallback={<div class={styles.loadingStacksText}></div>}
      >
        {(stack) => <div class={styles.stackSlider}>{stack()}</div>}
      </For>

      <div
        class={styles.bottomMargin}
        style={{ height: `${stackState().shelfHeight}px` }}
      ></div>
      <Switch fallback={<></>}>
        <Match when={stackState().stackCount > 1}>
          <BackButton />
        </Match>
      </Switch>
    </div>
  );
}
