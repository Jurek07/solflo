// Stub for node-localstorage to use browser localStorage instead

class LocalStorage {
  constructor() {
    // Use browser localStorage
  }

  getItem(key) {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }
    return null;
  }

  setItem(key, value) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  }

  removeItem(key) {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  }

  clear() {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  }

  key(index) {
    if (typeof window !== 'undefined') {
      return window.localStorage.key(index);
    }
    return null;
  }

  get length() {
    if (typeof window !== 'undefined') {
      return window.localStorage.length;
    }
    return 0;
  }
}

module.exports = { LocalStorage };
module.exports.LocalStorage = LocalStorage;
