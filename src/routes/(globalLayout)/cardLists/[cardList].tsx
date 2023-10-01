import { useParams } from "solid-start";
import FrontPageHeader from "../../../components/layoutComponents/frontPageHeader/FrontPageHeader";

export default function cardListPage() {
  const pathInput = useParams();
  return (
    <>
      <FrontPageHeader />
      <div style={{ color: "red" }}>{pathInput.cardList}</div>;
    </>
  );
}
