import { useParams } from "solid-start";
import FrontPageHeader from "../../../components/layoutComponents/frontPageHeader/FrontPageHeader";
import cardListFetcher from "../../../components/cardListPage/cardListFetcher";
import CardListScene from "~/components/cardListPage/cardListScene/CardListScene";

export default function cardListPage() {
  const pathInput = useParams();
  cardListFetcher(`${pathInput.cardList}`);
  return (
    <>
      <FrontPageHeader />
      <CardListScene />
    </>
  );
}
