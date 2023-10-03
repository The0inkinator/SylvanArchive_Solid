import { createSignal, createContext, useContext } from "solid-js";

const CardListContext = createContext();

export function CardListProvider(props: any) {
  const [cardList, setCardList] = createSignal<any>(null),
    cardListState = [
      cardList,
      {
        makeCardList(input: any) {
          setCardList(input);
        },
      },
    ];

  return (
    <CardListContext.Provider value={cardListState}>
      {props.children}
    </CardListContext.Provider>
  );
}

export function useCardListContext() {
  return useContext(CardListContext);
}
