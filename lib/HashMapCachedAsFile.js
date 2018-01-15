const fs = require('fs');

function HashMapCachedAsFile(filePath, fetchKey) {
  this.memoryCache = {};
  this.fetchKey = fetchKey;
  
  HashMapCachedAsFile.prototype.get = async function get(key) {
    if (!this.memoryCache[key]) {
      const value = await this.fetchKey(key);
      this.set(key, value);
    }

    return this.memoryCache[key];
  }

  HashMapCachedAsFile.prototype.set = function set(key, value) {
    this.memoryCache[key] = value;
    this.save();
  }

  HashMapCachedAsFile.prototype.load = function load() {
    const fileContent = fs.existsSync(filePath) ? fs.readFileSync(filePath) : undefined;
    if (!fileContent) {
      this.memoryCache = {};
    } else {
      this.memoryCache = JSON.parse(fileContent);
    }
  }

  HashMapCachedAsFile.prototype.save = function save(content = this.memoryCache) {
    fs.writeFileSync(filePath, JSON.stringify(content));
  }
}

module.exports = HashMapCachedAsFile;
