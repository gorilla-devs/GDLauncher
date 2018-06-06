export function extractLibsList(json) {
  const libs = [];
  json.libraries.map((lib) => {
    if (Object.prototype.hasOwnProperty.call(lib.downloads, 'artifact')) {
      libs.push(lib.downloads.artifact.url);
    }
  });
  return libs;
}