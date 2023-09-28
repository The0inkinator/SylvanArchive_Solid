import { createSignal, createContext, useContext } from "solid-js";

const StackStateContext = createContext();

interface stackInfo {
  activeStack: any;
  loadingStack: string | "none";
  stackCount: number;
  stacksToClose: number;
  shelfHeight: number;
  stackMapLoaded: boolean;
}

export function StackStateProvider(props: any) {
  const [stackState, setStackState] = createSignal<stackInfo>({
      activeStack: null,
      loadingStack: "none",
      stackCount: 0,
      stacksToClose: 0,
      shelfHeight: 0,
      stackMapLoaded: false,
    }),
    stackStateList = [
      stackState,
      {
        changeActiveStack(input: any) {
          setStackState({
            activeStack: input,
            loadingStack: stackState().loadingStack,
            stackCount: stackState().stackCount,
            stacksToClose: stackState().stacksToClose,
            shelfHeight: stackState().shelfHeight,
            stackMapLoaded: stackState().stackMapLoaded,
          });
        },
        loadStack(inputPath: string | "none") {
          stackState().loadingStack = inputPath;
        },
        addToStackCount(inputNumber: number) {
          const newStackCount = stackState().stackCount + inputNumber;
          // stackState().stackCount = newStackCount;
          setStackState({
            activeStack: stackState().activeStack,
            loadingStack: stackState().loadingStack,
            stackCount: newStackCount,
            stacksToClose: stackState().stacksToClose,
            shelfHeight: stackState().shelfHeight,
            stackMapLoaded: stackState().stackMapLoaded,
          });
        },
        closeXStacks(inputNumber: number) {
          stackState().stacksToClose = inputNumber;
        },
        setShelfHeight(inputNumber: number) {
          stackState().shelfHeight = inputNumber;
        },
        updateStackMapLoadStatus(input: boolean) {
          setStackState({
            activeStack: stackState().activeStack,
            loadingStack: stackState().loadingStack,
            stackCount: stackState().stackCount,
            stacksToClose: stackState().stacksToClose,
            shelfHeight: stackState().shelfHeight,
            stackMapLoaded: input,
          });
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
