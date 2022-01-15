import { storage } from '../firebase-config';
const fs = require('fs');

export const importImages = () => {

  // Get all directory names in images folder
  const getDirectories = fs.readdirSync('../../images', { withFileTypes: true })
    .filter((dirent: { isDirectory: () => boolean; }) => dirent.isDirectory())
    .map((dirent: { name: string; }) => dirent.name);

  // Walk all directories gotten above and upload each file within
  getDirectories.forEach((dirName: string) => {
    fs.readdirSync('../../images/' + dirName).forEach((file: string) => {
      uploadFile(dirName + '/' + file);
    })
  });
};

// filename: directory + filename from ../../images onwards, e.g. teams/compsoc.jpg
// Uploads specified file to firebase storage
async function uploadFile(filename: string) {
  await storage.bucket().upload('../../images/' + filename, {
    destination: 'images/' + filename,
  });
}