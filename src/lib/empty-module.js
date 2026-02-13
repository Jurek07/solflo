// Mock module for node: modules that can't be polyfilled in browser
// Provides minimal stubs to prevent runtime errors

module.exports = {
  // fs stubs
  statSync: () => ({ isDirectory: () => false, isFile: () => true }),
  existsSync: () => false,
  readFileSync: () => '',
  writeFileSync: () => {},
  mkdirSync: () => {},
  readdirSync: () => [],
  unlinkSync: () => {},
  rmdirSync: () => {},
  
  // worker_threads stubs
  Worker: class {},
  isMainThread: true,
  parentPort: null,
  workerData: null,
};
