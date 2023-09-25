import { createSignal, createContext, useContext } from "solid-js";

const StackMapContext = createContext();

export function StackMapProvider(props: any) {
  const [stackMap, setStackMap] = createSignal<any>(null),
    stackMapState = [
      stackMap,
      {
        makeStackMap(input: any) {
          setStackMap(input);
        },
      },
    ];

  return (
    <StackMapContext.Provider value={stackMapState}>
      {props.children}
    </StackMapContext.Provider>
  );
}

export function useStackMapContext() {
  return useContext(StackMapContext);
}
