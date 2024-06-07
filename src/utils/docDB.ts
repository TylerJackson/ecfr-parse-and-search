import { Chunk } from "./htmlParser";
import { MongoClient } from "mongodb";

// Function to save chunk to AWS DocumentDB
const saveToDocumentDB = async (chunks: Chunk[]) => {
  // AWS DocumentDB configuration
  const client = new MongoClient(
    "mongodb://mancommprojlambda2:<pw>@docdb-2024-06-03-16-53-47.c74ea0yg6bs0.us-east-1.docdb.amazonaws.com:27017/?retryWrites=false"
  );

  await client.connect();
  const db = client.db("mancommproj");
  const collection = db.collection("regdocs");
  try {
    // chunk.embedding = await createEmbedding(chunk.title);
    await collection.insertMany(chunks);

    await client.close();
    console.log(`Chunks saved to DocumentDB: ${chunks.length} chunks`);
  } catch (error) {
    await client.close();
    console.error("Error saving to DocumentDB:", error);
  }
};

const search = async (searchText: string) => {
  // AWS DocumentDB configuration
  const client = new MongoClient(
    "mongodb://mancommprojlambda2:<pw>@docdb-2024-06-03-16-53-47.c74ea0yg6bs0.us-east-1.docdb.amazonaws.com:27017/?retryWrites=false"
  );
  await client.connect();
  // Perform text search
  const query = { $text: { $search: searchText } };
  const rankingInfo = { score: { $meta: "textScore" } };
  // .find(query, rankingInfo).sort({ score: { $meta: "textScore" } }).limit(1)
  const db = client.db("mancommproj");
  const collection = db.collection("regdocs");
  try {
    const results = await collection
      .find(query, {
        projection: rankingInfo,
        sort: rankingInfo,
        limit: 5,
      })
      .toArray();
    await client.close();
    return results;
  } catch {
    await client.close();
  }
};
export default {
  saveToDocumentDB,
  search,
};
