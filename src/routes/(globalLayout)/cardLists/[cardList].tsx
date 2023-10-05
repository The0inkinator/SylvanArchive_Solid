import { useParams } from "solid-start";
import FrontPageHeader from "../../../components/layoutComponents/frontPageHeader/FrontPageHeader";
import cardListFetcher from "../../../components/cardListPage/cardListFetcher";
import CardListScene from "~/components/cardListPage/cardListScene/CardListScene";
import server$ from "solid-start/server";
import { MongoClient } from "mongodb";

export default function cardListPage() {
  const pathInput = useParams();
  cardListFetcher(`${pathInput.cardList}`);
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
      console.log(bindersData);
      await client.close();
      console.log("Connection closed");

      return bindersData;
    } catch (err) {
      console.error("Error connecting to database", err);
    }
  });
  return (
    <>
      <FrontPageHeader />
      <CardListScene />
    </>
  );
}
