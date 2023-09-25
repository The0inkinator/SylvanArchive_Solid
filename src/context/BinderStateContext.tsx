import { createSignal, createContext, useContext } from "solid-js";

const BinderStateContext = createContext();

interface binderInfo {
  hoveredBinder: number;
  selectedBinder: number;
}

export function BinderStateProvider(props: any) {
  const [binderState, setBinderState] = createSignal<binderInfo>({
      hoveredBinder: 0,
      selectedBinder: 0,
    }),
    binderStateList = [
      binderState,
      {
        setSelectedBinder(inputNumber: number) {
          setBinderState({
            hoveredBinder: binderState().hoveredBinder,
            selectedBinder: inputNumber,
          });
        },
        setHoveredBinder(inputNumber: number) {
          setBinderState({
            hoveredBinder: inputNumber,
            selectedBinder: binderState().selectedBinder,
          });
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
