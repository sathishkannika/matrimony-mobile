/**
 * react-native-ssl-pinning@1.6.0 still calls jcenter() (removed in current Gradle)
 * and ships AGP 2.3. Re-apply after every npm install.
 */
const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-ssl-pinning',
  'android',
  'build.gradle',
);

if (!fs.existsSync(target)) {
  process.exit(0);
}

const patched = `apply plugin: 'com.android.library'

android {
    namespace "com.toyberman"
    compileSdkVersion rootProject.ext.has("compileSdkVersion") ? rootProject.ext.compileSdkVersion : 35

    defaultConfig {
        minSdkVersion 16
    }
    buildFeatures {
        buildConfig true
    }
    lint {
        abortOnError false
    }
}

repositories {
    google()
    mavenCentral()
    maven { url 'https://www.jitpack.io' }
}

dependencies {
    implementation "com.facebook.react:react-native:+"
    implementation "com.squareup.okhttp3:okhttp:4.9.0"
    implementation "com.squareup.okio:okio:2.6.0"
    implementation "com.github.franmontiel:PersistentCookieJar:v1.0.1"
    implementation "com.squareup.okhttp3:logging-interceptor:4.9.0"
    implementation "com.squareup.okhttp3:okhttp-urlconnection:4.9.0"
}
`;

if (fs.readFileSync(target, 'utf8') !== patched) {
  fs.writeFileSync(target, patched);
}
