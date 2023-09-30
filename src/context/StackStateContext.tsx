import { createSignal, createContext, useContext } from "solid-js";

const StackStateContext = createContext();

interface stackInfo {
  activeStack: any;
  loadingStack: string | "none";
  stackCount: number;
  stacksToClose: number;
  stackMapLoaded: boolean;
  hoveredStack: number;
}

export function StackStateProvider(props: any) {
  const [stackState, setStackState] = createSignal<stackInfo>({
      activeStack: null,
      loadingStack: "none",
      stackCount: 1,
      stacksToClose: 0,
      stackMapLoaded: false,
      hoveredStack: 1,
    }),
    stackStateList = [
      stackState,
      {
        changeActiveStack(input: any) {
          setStackState((prevState) => ({
            ...prevState,
            activeStack: input,
          }));
        },
        loadStack(inputPath: string | "none") {
          setStackState((prevState) => ({
            ...prevState,
            loadingStack: inputPath,
          }));
        },
        addToStackCount(inputNumber: number) {
          const newStackCount = stackState().stackCount + inputNumber;
          setStackState((prevState) => ({
            ...prevState,
            stackCount: newStackCount,
          }));
        },
        closeXStacks(inputNumber: number) {
          setStackState((prevState) => ({
            ...prevState,
            stacksToClose: inputNumber,
          }));
        },
        updateStackMapLoadStatus(input: boolean) {
          setStackState((prevState) => ({
            ...prevState,
            stackMapLoaded: input,
          }));
        },
        setHoveredStack(inputNumber: number) {
          setStackState((prevState) => ({
            ...prevState,
            hoveredStack: inputNumber,
          }));
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
