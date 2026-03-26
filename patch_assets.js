const fs = require('fs');

const path = 'src/pages/Assets.tsx';
let data = fs.readFileSync(path, 'utf8');

data = data.replace(
  `} else if (node.directUrl) {
      window.open(node.directUrl, "_blank");
    }`,
  `} else if (node.isPdf && node.directUrl) {
      window.open("https://mozilla.github.io/pdf.js/web/viewer.html?file=" + encodeURIComponent(node.directUrl), "_blank");
    } else if (node.directUrl) {
      window.open(node.directUrl, "_blank");
    }`
);

fs.writeFileSync(path, data);