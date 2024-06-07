import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "<apikey>",
});

// Function to create embeddings
async function createEmbedding(_text: string) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: _text,
      dimensions: 2000,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error creating embedding:", error);
    return null;
  }
}
// Function to create embeddings
async function createEmbeddingBatch(_texts: string[]) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: _texts,
      dimensions: 2000,
    });
    return response.data.map((x) => x.embedding);
  } catch (error) {
    console.error("Error creating embedding:", error);
    return null;
  }
}

export default {
  createEmbedding,
  createEmbeddingBatch,
};
