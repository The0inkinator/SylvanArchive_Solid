import { useParams } from "solid-start";
import FrontPageHeader from "../../../components/layoutComponents/frontPageHeader/FrontPageHeader";
import cardListFetcher from "../../../components/cardListPage/cardListFetcher";
import CardListScene from "~/components/cardListPage/cardListScene/CardListScene";
import server$ from "solid-start/server";
import { MongoClient } from "mongodb";
import { createEffect } from "solid-js";
import { useCardListContext } from "~/context/CardListContext";

export default function cardListPage() {
  const [cardList, { makeCardList }]: any = useCardListContext();
  const pathInput = useParams();
  cardListFetcher(`${pathInput.cardList}`);
  let insertDataHere: any;

  const data = server$(async () => {
    const uri =
      "mongodb+srv://SylvanArchiveAPI:getAPIPass@sylvanarchivedb.zodmskg.mongodb.net/";
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const db = client.db("sylvanArchiveDB");
      console.log("connected");
      const binders = db.collection("binders");
      const cursor = binders.find({});
      const bindersData = await cursor.toArray();
      await client.close();
      console.log("Connection closed");

      return bindersData;
    } catch (err) {
      console.error("Error connecting to database", err);
    }
  });

  data();

  // createEffect(async () => {
  //   console.log(data());
  // });
  return (
    <>
      <FrontPageHeader />
      <CardListScene />
    </>
  );
}
