cmake_minimum_required(VERSION 3.13)
project(appmodules)
include(${REACT_ANDROID_DIR}/cmake-utils/ReactNative-application.cmake)
# ponytail: NDK 27 + CMake 3.22 on Windows leaves ANDROID_STL UNINITIALIZED, so
# CMAKE_CXX_STANDARD_LIBRARIES is only `-latomic -lm`. Link libc++ onto every
# codegen .so (via common_flags) until AGP/NDK consume ANDROID_STL=c++_shared.
target_link_libraries(common_flags INTERFACE c++_shared)
target_link_libraries(${CMAKE_PROJECT_NAME} c++_shared)
