const fs = require('fs');

function format(num) {
  return '0'.repeat(num < 10) + num;
}

if (fs.existsSync('reports/latest')) {
  const currentDate = new Date();
  const dateString =
    currentDate.getFullYear() +
    format(currentDate.getMonth()) +
    format(currentDate.getDate());
  const folderName = `reports/${dateString}`;
  let finalFolderName = folderName;
  let counter = 0;

  while (fs.existsSync(finalFolderName)) {
    finalFolderName = `${folderName}-${++counter}`;
  }

  fs.renameSync('reports/latest', finalFolderName);
}
