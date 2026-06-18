const fs = require('fs');
const path = require('path');

// Define the source and destination directories
const sourceDir = 'src/modules';
const destDir = 'dist/modules';
const resourceDir = 'src/resources';
const destResourceDir = 'dist/resources';

// Function to copy views recursively
const copyViews = (source, destination) => {
    fs.readdirSync(source).forEach(item => {
        const sourcePath = path.join(source, item);
        const destPath = path.join(destination, item);
        if (fs.statSync(sourcePath).isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyViews(sourcePath, destPath);
        } else {
            if (path.extname(sourcePath) == '.ejs') {
                fs.copyFileSync(sourcePath, destPath);
            }
        }
    });
};
const copyResources = (source, destination) => {
    fs.readdirSync(source).forEach(item => {
        const sourcePath = path.join(source, item);
        const destPath = path.join(destination, item);
        if (fs.statSync(sourcePath).isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyViews(sourcePath, destPath);
        } else {
            if (path.extname(sourcePath) == '.ejs') {
                fs.copyFileSync(sourcePath, destPath);
            }
        }
    });
};

// Copy views from source to destination
copyViews(sourceDir, destDir);
copyResources(resourceDir, destResourceDir);