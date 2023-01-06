/**
 * @fileoverview Enforces: TODO
 * @author Alican Erdogan <https://github.com/alicanerdogan>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require("../../rules/parent-level-class-use");
import { RuleTester } from "eslint";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2015,
  },
});

const validFile1 = `
import { style } from 'react-css-cx';
`;

const validFile2 = `
import { style } from 'react-css-cx';

const Container = style\`
p-[5px]
\`;
`;

const validFile3 = `
import { style } from 'another-style';

const Container = style\`
m-[5px]
\`;
`;

const validFile4 = `
import {} from 'react-css-cx';
import { style } from 'another-style';

const Container = style\`
m-[5px]
\`;
`;

const invalidFile1 = `
import { style } from 'react-css-cx';

const xyz = style\`
m-[5px]
\`;
`;

const invalidFile2 = `
import { style } from 'react-css-cx';

const xyz = style\`
sm:m-[5px]
\`;
`;

const invalidFile3 = `
import { style as styleFn } from 'react-css-cx';

const xyz = styleFn\`
sm:m-[5px]
\`;
`;

ruleTester.run("check-template-string", rule, {
  valid: [
    {
      code: validFile1,
      options: [],
    },
    {
      code: validFile2,
      options: [],
    },
    {
      code: validFile3,
      options: [],
    },
    {
      code: validFile4,
      options: [],
    },
  ],

  invalid: [
    {
      code: invalidFile1,
      errors: [
        {
          message: "Disallowed tailwind classes are in use: m-[5px]",
        },
      ],
    },
    {
      code: invalidFile2,
      errors: [
        {
          message: "Disallowed tailwind classes are in use: sm:m-[5px]",
        },
      ],
    },
    {
      code: invalidFile3,
      errors: [
        {
          message: "Disallowed tailwind classes are in use: sm:m-[5px]",
        },
      ],
    },
  ],
});
