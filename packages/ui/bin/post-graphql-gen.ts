import fs from "fs";

const indexerPath = "src/utils/api/indexer/generated.ts";

fs.readFile(indexerPath, "utf8", (err: Error, data: string) => {
  if (err) {
    return console.log(err);
  }
  // Suppress unused variable error from tsc in generated file
  const res = data.replace(/, QueryFunctionContext /g, "");

  fs.writeFile(indexerPath, res, "utf8", (err: Error) => {
    if (err) return console.log(err);
  });
});
