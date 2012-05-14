#!/bin/sh

cd v3/build/css/ && ./buildcss.sh && cd ../../../ && ./upload.sh ambit-theme-v3-test v3/build/css/StyleSheet.tid
