const fs = require('fs');

function HashMapCachedAsFile(filePath, fetchKey) {
  const memoryCache = undefined;

  HashMapCachedAsFile.prototype.get = function get(key) {
    if (!memoryCache[key]) {
      memoryCache[key] = fetchKey();
      this.save();
    }

    return memoryCache[key];
  }

  HashMapCachedAsFile.prototype.set = function set(key, value) {
    memoryCache[key] = value;
    this.save();
  }

  HashMapCachedAsFile.prototype.load = function load() {
    const fileContent = fs.existsSync(filePath) ? fs.readFileSync(filePath) : undefined;
    if (!fileContent) {
      memoryCache = {};
    } else {
      memoryCache = JSON.parse(fileContent);
    }
  }

  HashMapCachedAsFile.prototype.save = function save(content = memoryCache) {
    fs.writeFileSync(filePath, JSON.stringify(content));
  }
}

module.exports = HashMapCachedAsFile;
