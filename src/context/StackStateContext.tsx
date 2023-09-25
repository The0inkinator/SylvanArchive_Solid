import { createSignal, createContext, useContext } from "solid-js";

const StackStateContext = createContext();

interface stackInfo {
  activeStack: any;
  queuedStack: string | "none";
  stackCount: number;
  stacksToClose: number;
  shelfHeight: number;
}

export function StackStateProvider(props: any) {
  const [stackState, setStackState] = createSignal<stackInfo>({
      activeStack: null,
      queuedStack: "none",
      stackCount: 0,
      stacksToClose: 0,
      shelfHeight: 0,
    }),
    stackStateList = [
      stackState,
      {
        changeActiveStack(input: any) {
          setStackState({
            activeStack: input,
            queuedStack: stackState().queuedStack,
            stackCount: stackState().stackCount,
            stacksToClose: stackState().stacksToClose,
            shelfHeight: stackState().shelfHeight,
          });
        },
        queueStack(inputPath: string | "none") {
          stackState().queuedStack = inputPath;
        },
        addToStackCount(inputNumber: number) {
          const newStackCount = stackState().stackCount + inputNumber;
          // stackState().stackCount = newStackCount;
          setStackState({
            activeStack: stackState().activeStack,
            queuedStack: stackState().queuedStack,
            stackCount: newStackCount,
            stacksToClose: stackState().stacksToClose,
            shelfHeight: stackState().shelfHeight,
          });
        },
        closeXStacks(inputNumber: number) {
          stackState().stacksToClose = inputNumber;
        },
        setShelfHeight(inputNumber: number) {
          stackState().shelfHeight = inputNumber;
        },
      },
    ];

  return (
    <StackStateContext.Provider value={stackStateList}>
      {props.children}
    </StackStateContext.Provider>
  );
}

export function useStackStateContext() {
  return useContext(StackStateContext);
}
