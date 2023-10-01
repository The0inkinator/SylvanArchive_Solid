import { createSignal, createContext, useContext } from "solid-js";

const BinderStateContext = createContext();

interface binderInfo {
  hoveredBinder: number;
  selectedBinder: number;
  waitingToLoad: boolean;
}

export function BinderStateProvider(props: any) {
  const [binderState, setBinderState] = createSignal<binderInfo>({
      hoveredBinder: 0,
      selectedBinder: 0,
      waitingToLoad: false,
    }),
    binderStateList = [
      binderState,
      {
        setSelectedBinder(inputNumber: number) {
          setBinderState((prevState) => ({
            ...prevState,
            selectedBinder: inputNumber,
          }));
        },
        setHoveredBinder(inputNumber: number) {
          setBinderState((prevState) => ({
            ...prevState,
            hoveredBinder: inputNumber,
          }));
        },
        setWaitingToLoad(input: boolean) {
          setBinderState((prevState) => ({
            ...prevState,
            waitingToLoad: input,
          }));
        },
      },
    ];

  return (
    <BinderStateContext.Provider value={binderStateList}>
      {props.children}
    </BinderStateContext.Provider>
  );
}

export function useBinderStateContext() {
  return useContext(BinderStateContext);
}
