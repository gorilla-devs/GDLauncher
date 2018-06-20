const axios = require('axios');
const fs = require('fs');
const constants = require('../../constants');

module.exports = {
  extractLibs,
  extractAssets
};

function extractLibs(json) {
  const libs = [];
  json.libraries.map((lib) => {
    if (Object.prototype.hasOwnProperty.call(lib.downloads, 'artifact')) {
      const filePath = `${constants.LAUNCHER_FOLDER}/libraries/${lib.downloads.artifact.path}`;
      if (!fs.existsSync(filePath)) {
        libs.push({
          url: lib.downloads.artifact.url,
          path: lib.downloads.artifact.path
        });
      }
    }
  });
  return libs;
}

async function extractAssets(json) {
  const assets = [];
  await axios.get(json.assetIndex.url).then((res) => {
    Object.keys(res.data.objects).map(asset => {
      const assetCont = res.data.objects[asset];
      const filePath = `${constants.LAUNCHER_FOLDER}/assets/${assetCont.hash.substring(0, 2)}/${assetCont.hash}`;
      if (!fs.existsSync(filePath)) {
        assets.push({
          url: `http://resources.download.minecraft.net/${assetCont.hash.substring(0, 2)}/${assetCont.hash}`,
          path: `${assetCont.hash.substring(0, 2)}/${assetCont.hash}`
        });
      }
    });
  });
  return assets;
}
