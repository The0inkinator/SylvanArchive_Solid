import { CardFetcher } from "~/fetchers/ScryfallAPIFetcher";
import { createEffect, createSignal } from "solid-js";
import styles from "./Card.module.css";

interface cardInputs {
  image: string;
}

export default function Card({ image }: cardInputs) {
  const [cardArt, setCardArt] = createSignal<string | null>();

  createEffect(async () => {
    const loadedArt = await CardFetcher(image);

    setCardArt(loadedArt);
  });

  return (
    <div
      class={styles.card}
      style={{
        "background-image": cardArt() ? `url(${cardArt()})` : "none",
      }}
    ></div>
  );
}
