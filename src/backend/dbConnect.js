import { MongoClient } from "mongodb";

export async function connectToDB() {
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
}

connectToDB();
