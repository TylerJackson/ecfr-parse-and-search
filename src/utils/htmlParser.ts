import * as cheerio from "cheerio";

export interface Chunk {
  id: string;
  title: string;
  location: string;
  embedding?: number[];
}
const parseECFRHtml = (htmlToParse: string) => {
  const $ = cheerio.load(htmlToParse ?? "");
  let parsedChunks: Chunk[] = [];

  const titleElement = $("div.title");
  const title = titleElement.children("h1").text();
  const titleId = titleElement.attr("id") ?? title;
  parsedChunks.push({ id: titleId, title, location: "" });

  $(titleElement)
    .find("div.subtitle")
    .each((_index, subTitleElement: cheerio.Element) => {
      const subTitle = $(subTitleElement).children("h2").text();
      const subTitleId = subTitleElement.attribs["id"] ?? subTitle;
      parsedChunks.push({
        id: subTitleId,
        title: subTitle,
        location: `${titleId}`,
      });

      $(subTitleElement)
        .find("div.part")
        .each((_index, partElement) => {
          const partTitle = $(partElement).children("h1").text();
          const partId = partElement.attribs["id"] ?? partTitle;
          parsedChunks.push({
            id: partId,
            title: partTitle,
            location: `${titleId}#${subTitleId}`,
          });

          $(partElement)
            .find("div.subpart")
            .each((_index, subPartElement) => {
              const subPartTitle = $(subPartElement).children("h2").text();
              const subPartId = subPartElement.attribs["id"] ?? subPartTitle;
              parsedChunks.push({
                id: subPartId,
                title: subPartTitle,
                location: `${titleId}#${subTitleId}#${partId}`,
              });

              $(subPartElement)
                .find("div.section")
                .each((_index, sectionElement) => {
                  const sectionTitle = $(sectionElement).children("h4").text();
                  const content = $(sectionElement).text();
                  if (content.length > 8000) {
                    for (let i = 0; i < content.length; i += 8000) {
                      const sectionId =
                        sectionElement.attribs["id"] ?? sectionTitle;
                      const subSectionId = `${sectionId}-${i}`;
                      parsedChunks.push({
                        id: subSectionId,
                        title: content.substring(i, i + 8000),
                        location: `${titleId}#${subTitleId}#${partId}#${subPartId}`,
                      });
                    }
                  } else {
                    const sectionId =
                      sectionElement.attribs["id"] ?? sectionTitle;
                    parsedChunks.push({
                      id: sectionId,
                      title: content,
                      location: `${titleId}#${subTitleId}#${partId}#${subPartId}`,
                    });
                  }
                });
            });

          // for the parts that have no subparts the section is a child of the part
          $(partElement)
            .children("div.section")
            .each((_index, sectionElement) => {
              const sectionTitle = $(sectionElement).children("h4").text();
              const content = $(sectionElement).text();
              if (content.length > 8000) {
                for (let i = 0; i < content.length; i += 8000) {
                  const sectionId =
                    sectionElement.attribs["id"] ?? sectionTitle;
                  const subSectionId = `${sectionId}-${i}`;
                  parsedChunks.push({
                    id: subSectionId,
                    title: content.substring(i, i + 8000),
                    location: `${titleId}#${subTitleId}#${partId}`,
                  });
                }
              } else {
                const sectionId = sectionElement.attribs["id"] ?? sectionTitle;
                parsedChunks.push({
                  id: sectionId,
                  title: content,
                  location: `${titleId}#${subTitleId}#${partId}`,
                });
              }
            });
        });
    });
  return parsedChunks;
};

export default {
  parseECFRHtml,
};
