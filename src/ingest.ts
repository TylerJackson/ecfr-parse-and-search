import axios from "axios";
import s3Utils from "./utils/s3";

module.exports.handler = async (event: any) => {
  try {
    const responseHtml = await axios.get(
      "https://www.ecfr.gov/api/renderer/v1/content/enhanced/2024-03-01/title-49"
    );
    await s3Utils.uploadToS3(responseHtml.data, "title-49.html");

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "HTML file saved successfully" }),
    };
  } catch (err) {
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
