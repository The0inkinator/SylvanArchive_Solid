import { CardFetcher } from "~/fetchers/ScryfallAPIFetcher";
import { createEffect, createSignal } from "solid-js";

export default function Card(image: string) {
  const [cardArt, setCardArt] = createSignal<string | null>();

  createEffect(async () => {
    CardFetcher(image);
  });

  return (
    <div style={{ "background-image": cardArt() ? `${cardArt()}` : "" }}></div>
  );
}
