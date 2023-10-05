import { useCardListContext } from "~/context/CardListContext";

export default async function cardListFetcher(cardListPath: string) {
  const [cardList, { makeCardList }]: any = useCardListContext();
  try {
    const cardListData = await fetch(
      "https://sylvan-archive-api-03b13d1a78b5.herokuapp.com/tables/cardLists"
    );
    const tempCardList = await cardListData.json();

    interface cardInfo {
      card: string;
      lists: string[];
    }

    const finalList = await tempCardList.filter((card: cardInfo) =>
      card.lists.includes(cardListPath)
    );

    makeCardList(finalList);
  } catch (err) {
    console.log(err);
  }
}
