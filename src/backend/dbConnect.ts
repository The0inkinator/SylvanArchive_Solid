const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://SylvanArchiveAPI:getAPIPass@sylvanarchivedb.zodmskg.mongodb.net/";
const client = new MongoClient(uri);

async function connectToDB() {
  try {
    await client.connect();
    const db = client.db("sylvanArchiveDB");
    console.log("connected");
    await client.close();
    console.log("Connection closed");
  } catch (err) {
    console.error("Error connecting to database", err);
  }
}
