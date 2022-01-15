// @ts-nocheck

import { storage } from '../firebase-config';
import { ref } from 'firebase-admin/storage';
import data from '../../docs/default-firebase-data.json';
const fs = require('fs');

export const importImages = () => {

  // Get all directory names in images folder
  const getDirectories = source =>
    fs.readdirSync('../../images', { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

  // Walk all directories gotten above and upload each file within
  getDirectories().forEach(dirName => {
    fs.readdirSync('../../images/' + dirName).forEach(file => {
      uploadFile(dirName + '/' + file);
    })
  });
};

// filename: directory + filename from ../../images onwards, e.g. teams/compsoc.jpg
// Uploads specified file to firebase storage
async function uploadFile(filename) {
  await storage.bucket().upload('../../images/' + filename, {
    destination: 'images/' + filename,
  });
}