/**
 * NDK 27 + CMake 3.22 on Windows leaves ANDROID_STL unset, so librnscreens.so
 * links without libc++ (undefined std::mutex / operator new). Re-apply after npm install.
 */
const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-screens',
  'android',
  'CMakeLists.txt',
);

if (!fs.existsSync(target)) {
  process.exit(0);
}

const src = fs.readFileSync(target, 'utf8');
if (/\bc\+\+_shared\b/.test(src)) {
  process.exit(0);
}

const patched = src.replace(
  /target_link_libraries\(rnscreens\s+([\s\S]*?)android\n\)/,
  'target_link_libraries(rnscreens\n    $1android\n    c++_shared\n)',
);

if (patched === src) {
  process.exit(0);
}
fs.writeFileSync(target, patched);
