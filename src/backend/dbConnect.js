import { MongoClient } from "mongodb";

const uri =
  "mongodb+srv://SylvanArchiveAPI:getAPIPass@sylvanarchivedb.zodmskg.mongodb.net/";
const client = new MongoClient(uri);

async function connectToDB() {
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
  } catch (err) {
    console.error("Error connecting to database", err);
  }
}

connectToDB();
