import { useParams } from "solid-start";

export default function cardListPage() {
  const pathInput = useParams();
  return <div style={{ color: "red" }}>{pathInput.cardList}</div>;
}
