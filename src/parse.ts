import s3Utils from "./utils/s3";
import { Chunk, default as htmlParser } from "./utils/htmlParser";
import docDB from "./utils/docDB";

module.exports.handler = async (event: any) => {
  try {
    const htmlData = await s3Utils.downloadFromS3("title-49.html");
    const chunks: Chunk[] = htmlParser.parseECFRHtml(htmlData ?? "");

    await docDB.saveToDocumentDB(chunks);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Chunks processed and saved successfully",
        input: event,
      }),
    };
  } catch (err) {
    console.log("Error processing event:", err);
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: err.message,
          input: event,
        },
        null,
        2
      ),
    };
  }
};
