import styles from "./Stack.module.css";
import Binder from "../binder/Binder";
import { createSignal, createEffect, onMount, onCleanup, For } from "solid-js";
import { useStackDraggingContext } from "../../../context/StackDraggingContext";
import { useBinderStateContext } from "../../../context/BinderStateContext";
import { useStackStateContext } from "../../../context/StackStateContext";
import { useStackMapContext } from "../../../context/StackMapContext";

interface StackInputs {
  stackID: string;
  stackNum: number;
}

interface stackCollisionInputs {
  left: number;
  right: number;
}

export default function Stack({ stackID, stackNum }: StackInputs) {
  //Context States
  const [
    stackDragging,
    { dragToStill, dragToDragging, dragToDrifting, dragToLocked },
  ]: any = useStackDraggingContext();
  const [
    binderState,
    { setSelectedBinder, setHoveredBinder, setWaitingToLoad },
  ]: any = useBinderStateContext();
  const [stackState, { changeActiveStack, setHoveredStack }]: any =
    useStackStateContext();
  const [stackMap]: any = useStackMapContext();

  //State
  const [stackWidth, setStackWidth] = createSignal<number>(0);
  const [stackPosition, setStackPosition] = createSignal<number>(0);
  const [stackDataLoaded, setStackDataLoaded] = createSignal<boolean>(false);
  const [binderList, setBinderList] = createSignal<any[]>([]);

  //Ref Variables
  let thisStack: HTMLDivElement | null = null;
  let binderContainer: HTMLDivElement | null = null;
  //Listener Variables
  let thisStackActive: boolean = false;
  let stackHoveredForCursor: boolean = false;
  let localStackDragging: boolean = false;
  //Position Control Variables
  let stackOffsetX: number = 0;
  let newStackPosition: number = 0;
  let binderSize: number = 0;
  let selectedBinderCtr: number = 0;
  let stackCollision: stackCollisionInputs = { left: 0, right: 0 };

  //Drift Function Variables
  let driftRunning: boolean = false;
  let stackDrift: number = 0;
  let stackDriftSpeed: number = 0;

  //Slide Function Variables
  let slideRunning: boolean = false;
  let distanceToSlide: number = 0;

  onMount(() => {
    createEffect(() => {
      if (stackState().stackMapLoaded && !stackDataLoaded()) {
        let childrenOfThisStack = stackMap().stackList.filter(
          (stack: any) => stack.name === stackID
        );
        let loadedBinderList = stackMap().binderList.filter((binder: any) =>
          childrenOfThisStack[0].children.includes(binder.name)
        );

        const errorBinder = stackMap().binderList.filter(
          (binder: any) => binder.name === "nothingHereYet_none"
        );

        setStackDataLoaded(true);

        if (loadedBinderList.length > 0) {
          setBinderList(loadedBinderList);
          setDefaults();
        } else {
          setBinderList(errorBinder);
          setDefaults();
        }
      }
    });

    function setDefaults() {
      const windowWidth = window.innerWidth;
      if (thisStack) {
        const rootStyles = getComputedStyle(thisStack);
        binderSize = parseInt(rootStyles.getPropertyValue("--BinderSize")) * 16; //rem size
      }

      setStackWidth(binderList().length * binderSize);
      const stackStartingPos = () => {
        if (windowWidth - stackWidth() >= 0) {
          return windowWidth / 2 - stackWidth() / 2;
        } else {
          return (stackWidth() - windowWidth) / -2;
        }
      };

      if (selectedBinderCtr > 0) {
        const currentCenter: number = windowWidth / 2 - selectedBinderCtr;
        setStackPosition(currentCenter);
      } else {
        setStackPosition(stackStartingPos);
      }
      const collisionLeft = windowWidth / 2 - binderSize / 2;
      const collisionRight = windowWidth / 2 - (stackWidth() - binderSize / 2);
      stackCollision = { left: collisionLeft, right: collisionRight };
    }

    //handles window resize to update all relevant properties
    createEffect(() => {
      window.addEventListener("resize", setDefaults);

      onCleanup(() => {
        window.removeEventListener("resize", setDefaults);
      });
    });

    createEffect(() => {
      if (thisStack) {
        if (stackState().stackCount === stackNum && !thisStackActive) {
          thisStackActive = true;
          changeActiveStack(thisStack);
          setSelectedBinder(0);
          setHoveredBinder(0);
          thisStack.scrollIntoView({
            block: "center",
            behavior: "smooth",
          });
        }
      }
    });

    createEffect(() => {
      if (thisStack) {
        if (stackState().activeStack !== thisStack) {
          thisStackActive = false;
        }
      }
    });

    window.addEventListener("scroll", handleScroll);
    if (thisStack) thisStack.addEventListener("mousedown", handleMouseDown);
    if (thisStack) thisStack.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, {
      passive: false,
      capture: true,
    });
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleTouchEnd);
    if (thisStack) thisStack.addEventListener("dblclick", handleDoubleClick);
  });

  onCleanup(() => {
    window.removeEventListener("scroll", handleScroll);
    if (thisStack) thisStack.removeEventListener("mousedown", handleMouseDown);
    if (thisStack)
      thisStack.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("touchend", handleTouchEnd);
    if (thisStack) thisStack.removeEventListener("dblclick", handleDoubleClick);
  });

  const handleScroll = (event: any) => {
    if (thisStack) {
      const componentRect = thisStack.getBoundingClientRect();
      const windowCenter = window.innerHeight / 2;
      if (
        windowCenter > componentRect.top &&
        windowCenter < componentRect.bottom
      ) {
        setHoveredStack(stackNum);
      }
    }
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (thisStack && thisStackActive) {
      localStackDragging = true;
      stackOffsetX = event.clientX - stackPosition();
      document.body.style.cursor = "grabbing";
    }
  };

  const handleTouchStart = (event: TouchEvent) => {
    if (thisStack && thisStackActive && event.touches.length === 1) {
      localStackDragging = true;
      stackOffsetX = event.touches[0].clientX - stackPosition();
      document.body.style.cursor = "grabbing";
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (thisStackActive) {
      if (localStackDragging && stackDragging() !== "locked") {
        dragToDragging();
        drift();
      }
      if (stackDragging() === "dragging") {
        const mousePosX = event.clientX;
        newStackPosition = collisionCheck(mousePosX - stackOffsetX);
        setStackPosition(collisionCheck(newStackPosition));
      }
    }
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (thisStackActive) {
      if (localStackDragging && stackDragging() !== "locked") {
        dragToDragging();
        drift();
      }
      if (stackDragging() === "dragging") {
        event.preventDefault();
        const mousePosX = event.touches[0].clientX;
        newStackPosition = collisionCheck(mousePosX - stackOffsetX);
        setStackPosition(collisionCheck(newStackPosition));
      }
    }
  };

  const handleMouseUp = (event: MouseEvent) => {
    localStackDragging = false;
    if (thisStackActive) {
      if (!stackHoveredForCursor) {
        document.body.style.cursor = "auto";
      } else {
        document.body.style.cursor = "grab";
      }

      if (stackDragging() === "dragging") {
        dragToDrifting();
      }
    }
  };

  const handleTouchEnd = (event: TouchEvent) => {
    localStackDragging = false;
    if (thisStackActive) {
      if (stackDragging() === "dragging") {
        dragToDrifting();
      }
    }
  };

  const handleDoubleClick = (event: MouseEvent) => {
    if (stackDragging() === "still" && thisStackActive) {
      slide();
    }
  };

  function drift() {
    if (thisStackActive && !driftRunning) {
      driftRunning = true;
      setSelectedBinder(0);
      function loop() {
        if (stackDragging() === "dragging") {
          stackDriftSpeed = capDriftSpeed(stackDrift - stackPosition());
          const newStackDrift = stackPosition();
          stackDrift = newStackDrift;
          setTimeout(loop, 10);
        } else if (stackDragging() === "drifting") {
          if (Math.abs(stackDriftSpeed) > 1) {
            //Adjusting the single integer at the end of newStackSpeed will change the stack's "friction"
            //A higher number means lower "friction" and visa versa. Numbers below 1 will cause no friction
            const newStackSpeed = stackDriftSpeed - stackDriftSpeed / 16;
            const newStackPos = (() => {
              if (newStackSpeed > 0) {
                return stackPosition() - Math.abs(newStackSpeed);
              } else if (newStackSpeed < 0) {
                return stackPosition() + Math.abs(newStackSpeed);
              }
            })();
            setStackPosition(collisionCheck(newStackPos as number));
            stackDriftSpeed = newStackSpeed;
            setTimeout(loop, 5);
          } else if (stackDragging() === "drifting" && stackDriftSpeed < 1) {
            dragToStill();
            stackDriftSpeed = 0;
            driftRunning = false;
          } else {
            driftRunning = false;
          }
        }
      }
      loop();
    }
  }

  function slide() {
    if (!slideRunning && thisStackActive) {
      dragToLocked();
      setWaitingToLoad(true);
      slideRunning = true;
      const halfBinder = binderSize / 2;
      const screenCenter = window.innerWidth / 2;
      const binderInStack =
        binderSize * binderState().selectedBinder - halfBinder;
      selectedBinderCtr = binderInStack;
      distanceToSlide = screenCenter - (stackPosition() + binderInStack);

      function loop() {
        if (Math.abs(distanceToSlide) > 1) {
          let slideIncrement: number;
          distanceToSlide = screenCenter - (stackPosition() + binderInStack);
          slideIncrement = distanceToSlide / 10;
          newStackPosition = collisionCheck(stackPosition() + slideIncrement);
          setStackPosition(newStackPosition);
          setTimeout(loop, 1);
        } else {
          dragToStill();
          slideRunning = false;
        }
      }
      loop();
    }
  }

  //Function takes in the stack's screen position and prevents it from exceeding the set boundries
  function collisionCheck(pos: number) {
    if (pos > stackCollision.left) {
      return stackCollision.left;
    } else if (pos < stackCollision.right) {
      return stackCollision.right;
    } else {
      return pos;
    }
  }

  function capDriftSpeed(pos: number) {
    if (Math.abs(pos) > 20) {
      if (pos > 0) {
        return 20;
      } else if (pos < 0) {
        return -20;
      } else {
        return 0;
      }
    } else {
      return pos;
    }
  }

  return (
    <div
      class={styles.stackHandle}
      ref={(el) => (thisStack = el)}
      onmouseenter={() => {
        stackHoveredForCursor = true;
        if (stackDragging() !== "dragging") {
          document.body.style.cursor = "grab";
        }
      }}
      onclick={() => {}}
      onmouseleave={() => {
        stackHoveredForCursor = false;
        if (stackDragging() === "still") {
          document.body.style.cursor = "auto";
        }
      }}
      style={{
        //This is the property that handles the rendering of the stack position
        left: `${collisionCheck(stackPosition())}px`,
        //Stackwidth is set on mount and updated on resize
        width: `${stackWidth()}px`,
        // opacity: thisStackActive() ? "100%" : "50%",
      }}
    >
      <div class={styles.stackContainer} ref={(el) => (binderContainer = el)}>
        <For
          each={binderList()}
          fallback={<div class={styles.loadingListText}></div>}
        >
          {(binder: any, index: any) => {
            // console.log(`binders to load`, binder.name);
            return (
              <Binder
                title={binder.displayName}
                binderName={binder.name}
                displayArt={binder.displayArt}
                bgCards={binder.bgArts}
                binderNum={index() + 1}
                binderParentElement={thisStack}
                binderChildType={binder.childType}
              />
            );
          }}
        </For>
      </div>
    </div>
  );
}
