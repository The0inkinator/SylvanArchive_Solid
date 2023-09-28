import styles from "./Stack.module.css";
import Binder from "../binder/Binder";
import { createSignal, createEffect, onMount, onCleanup, For } from "solid-js";
import { useStackDraggingContext } from "../../../context/StackDraggingContext";
import { useBinderStateContext } from "../../../context/BinderStateContext";
import { useStackStateContext } from "../../../context/StackStateContext";
import { useStackMapContext } from "../../../context/StackMapContext";
import BackBinder from "../backBinder/BackBinder";

interface StackInputs {
  stackID: string;
}

export default function Stack({ stackID }: StackInputs) {
  //Property to track the pixel width of cards that the stack is made of
  const [binderSize, setBinderSize] = createSignal<number>(0);
  //Property to track the pixel width of the whole stack
  const [stackWidth, setStackWidth] = createSignal<number>(0);
  //Property to find the distance from mouse to stack corner
  const [stackOffsetX, setStackOffsetX] = createSignal<number>(0);
  //Tracks if mouse is over stack updated with a create effect in the body of the function
  let stackHovered: boolean = false;
  let localStackDragging: boolean = false;
  let stackNumber: number;
  //Context state for dragging
  const [
    stackDragging,
    { dragToStill, dragToDragging, dragToDrifting, dragToLocked },
  ]: any = useStackDraggingContext();
  //Number that directly controls where the stack is on screen through its "left" style
  const [stackPosition, setStackPosition] = createSignal<number>(0);
  //Secondary position for the handleMouseMove function
  const [newStackPosition, setNewStackPosition] = createSignal<number>(0);
  //Number that stores the most recent position of the stack to calculate its speed
  const [stackDrift, setStackDrift] = createSignal<number>(0);
  //Number that represents how fast the stack was being dragged when it is released
  const [stackDriftSpeed, setStackDriftSpeed] = createSignal<number>(0);
  //Object that marks the farthest the stack can be dragged left or right
  const [stackCollision, setStackCollision] = createSignal<{
    left: number;
    right: number;
  }>({ left: 0, right: 0 });
  //Context States
  const [binderState, { setSelectedBinder, setHoveredBinder }]: any =
    useBinderStateContext();
  const [stackState, { changeActiveStack, queueStack, addToStackCount }]: any =
    useStackStateContext();
  const [stackMap]: any = useStackMapContext();

  //State for slide function
  const [distanceToSlide, setDistanceToSlide] = createSignal<number>(0);
  const [canSlide, setCanSlide] = createSignal<boolean>(false);
  const [thisStackActive, setThisStackActive] = createSignal<boolean>(true);
  const [binderList, setBinderList] = createSignal<any[]>([]);
  const [selectedBinderCtr, setSelectedBinderCtr] = createSignal<number>(0);
  const [previouslyMounted, setPreviouslyMounted] =
    createSignal<boolean>(false);

  //typing for refs
  let thisStack: HTMLDivElement | null = null;
  let binderContainer: HTMLDivElement | null = null;

  //Function that: Sets the stack pixel width, Positions the stack in the screen center, sets the collision boundries for the stack
  //Called both on mount and on screen resize

  //Calls setDefaults and adds event listeners to handle clicking and dragging of the stack

  onMount(() => {
    function setDefaults() {
      const windowWidth = window.innerWidth;
      const remSize = 16;
      if (thisStack) {
        const rootStyles = getComputedStyle(thisStack);
        setBinderSize(
          parseInt(rootStyles.getPropertyValue("--BinderSize")) * remSize
        );
      }

      setStackWidth(binderList().length * binderSize());
      const stackStartingPos = () => {
        if (windowWidth - stackWidth() >= 0) {
          return windowWidth / 2 - stackWidth() / 2;
        } else {
          return (stackWidth() - windowWidth) / -2;
        }
      };

      if (selectedBinderCtr() > 0) {
        const currentCenter: number = windowWidth / 2 - selectedBinderCtr();
        setStackPosition(currentCenter);
      } else {
        setStackPosition(stackStartingPos);
      }
      const collisionLeft = windowWidth / 2 - binderSize() / 2;
      const collisionRight =
        windowWidth / 2 - (stackWidth() - binderSize() / 2);
      setStackCollision({ left: collisionLeft, right: collisionRight });
    }

    createEffect(() => {
      if (stackState().stackMapLoaded) {
        let childrenOfThisStack = stackMap().stackList.filter(
          (stack: any) => stack.name === stackID
        );
        let loadedBinderList = stackMap().binderList.filter((binder: any) =>
          childrenOfThisStack[0].children.includes(binder.name)
        );
        if (loadedBinderList.length > 0) {
          setBinderList(loadedBinderList);
          setDefaults();
        } else {
          console.error("No binder list");
        }
      }
    });

    //handles window resize to update all relevant properties
    createEffect(() => {
      window.addEventListener("resize", setDefaults);

      onCleanup(() => {
        window.removeEventListener("resize", setDefaults);
      });
    });

    addToStackCount(1);
    stackNumber = stackState().stackCount;

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, {
      passive: false,
      capture: true,
    });
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("dblclick", handleDoubleClick);

    changeActiveStack(thisStack);
    setHoveredBinder(0);
    setSelectedBinder(0);

    if (thisStack) {
      thisStack.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  });

  createEffect(() => {
    if (stackState().stackCount > stackNumber && !previouslyMounted()) {
      setPreviouslyMounted(true);
    }
  });

  createEffect(() => {
    if (stackState().stackCount === stackNumber && previouslyMounted()) {
      if (thisStack) {
        changeActiveStack(thisStack);
      }
      setPreviouslyMounted(false);
      setThisStackActive(true);
      setSelectedBinder(0);
      setHoveredBinder(0);
    }
  });

  onCleanup(() => {
    window.removeEventListener("mousedown", handleMouseDown);
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("touchend", handleTouchEnd);
    window.removeEventListener("dblclick", handleDoubleClick);
  });

  //handles mouseDown
  const handleMouseDown = (event: MouseEvent) => {
    if (thisStack) {
      const componentRect = thisStack.getBoundingClientRect();

      if (
        thisStackActive() &&
        event.clientX >= componentRect.left &&
        event.clientX <= componentRect.right &&
        event.clientY >= componentRect.top &&
        event.clientY <= componentRect.bottom
      ) {
        localStackDragging = true;
        slideCheck();
        setStackOffsetX(event.clientX - stackPosition());
        document.body.style.cursor = "grabbing";
      }
    }
  };

  //handles touchStart
  const handleTouchStart = (event: TouchEvent) => {
    if (thisStack && event.touches.length === 1) {
      const componentRect = thisStack.getBoundingClientRect();

      if (
        thisStackActive() &&
        event.touches[0].clientX >= componentRect.left &&
        event.touches[0].clientX <= componentRect.right &&
        event.touches[0].clientY >= componentRect.top &&
        event.touches[0].clientY <= componentRect.bottom
      ) {
        localStackDragging = true;
        setStackOffsetX(event.touches[0].clientX - stackPosition());
      }
    }
  };

  //handles mouseMove
  const handleMouseMove = (event: MouseEvent) => {
    if (thisStackActive()) {
      if (
        localStackDragging &&
        stackDragging() !== "dragging" &&
        stackDragging() !== "drifting"
      ) {
        dragToDragging();
        drift();
      }
      if (stackDragging() === "dragging") {
        const mousePosX = event.clientX;
        setNewStackPosition(collisionCheck(mousePosX - stackOffsetX()));
        setStackPosition(collisionCheck(newStackPosition()));
      }
    }
  };

  //handles touchMove
  const handleTouchMove = (event: TouchEvent) => {
    if (thisStackActive()) {
      if (
        localStackDragging &&
        stackDragging() !== "dragging" &&
        stackDragging() !== "drifting"
      ) {
        dragToDragging();
        drift();
      }
      if (stackDragging() === "dragging") {
        event.preventDefault();
        const mousePosX = event.touches[0].clientX;
        setNewStackPosition(collisionCheck(mousePosX - stackOffsetX()));
        setStackPosition(collisionCheck(newStackPosition()));
      }
    }
  };

  //handles mouseUp
  const handleMouseUp = (event: MouseEvent) => {
    localStackDragging = false;
    if (thisStackActive()) {
      if (!stackHovered) {
        document.body.style.cursor = "auto";
      } else {
        document.body.style.cursor = "grab";
      }

      if (stackDragging() === "dragging") {
        dragToDrifting();
      }
    }
  };

  //handles touchEnd
  const handleTouchEnd = (event: TouchEvent) => {
    localStackDragging = false;
    if (thisStackActive()) {
      if (stackDragging() === "dragging") {
        dragToDrifting();
      }
    }
  };

  const handleDoubleClick = (event: MouseEvent) => {
    if (thisStackActive() && stackHovered) {
      slideCheck();
    }
    if (canSlide() && stackDragging() === "still") {
      slide(binderState().selectedBinder);
    }
  };

  //Function takes in the stack's screen position and prevents it from exceeding the set boundries
  function collisionCheck(pos: number) {
    if (pos > stackCollision().left) {
      return stackCollision().left as number;
    } else if (pos < stackCollision().right) {
      return stackCollision().right as number;
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

  //This function is called when mouseDown and will loop while mouse down to track the stack's "speed"
  //Once mouseUp the function contiues to loop rather than tracking the "speed" it:
  //A. Moves the stack in the direction it was being dragged and then B. Reduces the speed and loops.
  //Once the speed falls below one it will revert the stack state back to "still"
  //This creates an ice-rink like effect
  function drift() {
    if (thisStackActive()) {
      setSelectedBinder(0);
      function loop() {
        if (stackDragging() === "dragging") {
          setStackDriftSpeed(capDriftSpeed(stackDrift() - stackPosition()));
          const newStackDrift = stackPosition();
          setStackDrift(newStackDrift);
          setTimeout(loop, 10);
        } else if (stackDragging() === "drifting") {
          if (Math.abs(stackDriftSpeed()) > 1) {
            //Adjusting the single integer at the end of newStackSpeed will change the stack's "friction"
            //A higher number means lower "friction" and visa versa. Numbers below 1 will cause no friction
            const newStackSpeed = stackDriftSpeed() - stackDriftSpeed() / 16;
            const newStackPos = (() => {
              if (newStackSpeed > 0) {
                return stackPosition() - Math.abs(newStackSpeed);
              } else if (newStackSpeed < 0) {
                return stackPosition() + Math.abs(newStackSpeed);
              }
            })();
            setStackPosition(collisionCheck(newStackPos as number));
            setStackDriftSpeed(newStackSpeed);
            // console.log(stackDriftSpeed());
            setTimeout(loop, 5);
          } else if (stackDragging() === "drifting" && stackDriftSpeed() < 1) {
            dragToStill();
            setStackDriftSpeed(0);
          }
        }
      }
      loop();
    }
  }

  function slideCheck() {
    if (thisStackActive()) {
      setCanSlide(true);
      let timer = 40;
      function loop() {
        if (timer > 0) {
          timer = timer - 1;
          setTimeout(loop, 1);
        } else setCanSlide(false);
      }
      loop();
    }
  }

  function slide(binder: number) {
    if (thisStackActive() && stackDragging() === "still") {
      dragToDrifting();
      const halfBinder = binderSize() / 2;
      const screenCenter = window.innerWidth / 2;
      const binderInStack = binderSize() * binder - halfBinder;
      setSelectedBinderCtr(binderInStack);
      setDistanceToSlide(screenCenter - (stackPosition() + binderInStack));
      function loop() {
        if (Math.abs(distanceToSlide()) > 1) {
          let slideIncrement: number;
          setDistanceToSlide(screenCenter - (stackPosition() + binderInStack));
          slideIncrement = distanceToSlide() / 8;
          setNewStackPosition(collisionCheck(stackPosition() + slideIncrement));
          setStackPosition(newStackPosition());

          setTimeout(loop, 1);
        } else {
          dragToLocked();
          if (stackDragging() === "locked") {
            dragToStill();
          }
        }
      }

      loop();
    }
  }

  createEffect(() => {
    if (thisStack === stackState().activeStack) {
      setThisStackActive(true);
    } else {
      setThisStackActive(false);
    }
  });

  return (
    <div
      class={styles.stackHandle}
      ref={(el) => (thisStack = el)}
      onmouseenter={() => {
        stackHovered = true;
        if (stackDragging() !== "dragging") {
          document.body.style.cursor = "grab";
        }
      }}
      onclick={() => {}}
      onmouseleave={() => {
        stackHovered = false;
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
