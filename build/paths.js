const path = require('path');

const baseDir       = path.resolve();
const baseOutputDir = path.join(baseDir, 'static');
const baseInputDir  = path.join(baseDir, 'src');

module.exports = {
    baseDir,
    baseOutputDir,
    baseInputDir
}
