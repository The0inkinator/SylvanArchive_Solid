import { useParams } from "solid-start";
import FrontPageHeader from "../../../components/layoutComponents/frontPageHeader/FrontPageHeader";
import cardListFetcher from "../../../components/cardListPage/cardListFetcher";

export default function cardListPage() {
  const pathInput = useParams();
  cardListFetcher(`${pathInput.cardList}`);
  return (
    <>
      <FrontPageHeader />
      <div style={{ color: "red" }}>{pathInput.cardList}</div>;
    </>
  );
}
