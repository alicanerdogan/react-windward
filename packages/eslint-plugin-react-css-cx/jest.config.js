// @ts-check

"use strict";

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  preset: "ts-jest",
  moduleNameMapper: {
    "^(\\.{1,2}\\/.*)\\.js$": "$1",
  },
  transformIgnorePatterns: [],
};

module.exports = config;
