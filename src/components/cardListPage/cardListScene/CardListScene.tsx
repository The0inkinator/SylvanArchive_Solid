import styles from "./CardListScene.module.css";
import Card from "../card/Card";
import { For } from "solid-js";
import { useCardListContext } from "../../../context/CardListContext";

interface cardInfo {
  card: string;
  lists: string[];
}

export default function CardListScene() {
  const [cardList]: any = useCardListContext();
  return (
    <div class={styles.cardListContainer}>
      <div class={styles.cardListBackdrop}>
        <div class={styles.cardList}>
          <For each={cardList()} fallback={<div></div>}>
            {(card: cardInfo, index: any) => {
              return <Card image={card.card} />;
            }}
          </For>
        </div>
      </div>
    </div>
  );
}
