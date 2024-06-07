import docDB from "./utils/docDB";

module.exports.handler = async (event: any) => {
  const queryStringParameters = event.queryStringParameters || {};
  const searchText = queryStringParameters.q || "";

  if (!searchText) {
    return {
      statusCode: 400,
      body: JSON.stringify('Query parameter "q" is required'),
    };
  }
  try {
    return {
      statusCode: 200,
      body: JSON.stringify(await docDB.search(searchText)),
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
