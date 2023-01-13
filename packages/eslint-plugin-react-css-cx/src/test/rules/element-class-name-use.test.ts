/**
 * @fileoverview Enforces: TODO
 * @author Alican Erdogan <https://github.com/alicanerdogan>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require("../../rules/element-class-name-use");
import { RuleTester } from "eslint";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
});

const validFile1 = `
import { style } from 'react-css-cx';

const Container = style("div")\`
p-[5px]
\`;

export const Component = () => {
  return (
    <Container className="mx-[5px]" />
  );
}
`;

const validFile2 = `
import { style } from 'react-css-cx';

const Container = style("div")\`
p-[5px]
\`;

export const Component = () => {
  return (
    <Container classNames="test-1" />
  );
}
`;

const invalidFile1 = `
import { style } from 'react-css-cx';

const Container = style("div")\`
p-[5px]
\`;

export const Component = () => {
  return (
    <Container className="test-1" />
  );
}
`;

const invalidFile2 = `
import { style } from 'react-css-cx';

const Container = style("div")\`
p-[5px]
\`;

export const Component = () => {
  return (
    <Container className="mx-[5px] flex-0 grow-1 test-1" />
  );
}
`;

const invalidFile3 = `
import { style } from 'react-css-cx';

const Container = style("div")\`
p-[5px]
\`;

export const Component = () => {
  const active = true;
  return (
    <Container className={"mx-[5px] flex-0 grow-1 test-2 test-3"} />
  );
}
`;

const invalidFile4 = `
import { style } from 'react-css-cx';

const Container = style("div")\`
p-[5px]
\`;

export const Component = () => {
  const active = true;
  return (
    <Container className={\`mx-[5px] flex-0 grow-1 test-4\`} />
  );
}
`;

const invalidFile5 = `
import { style } from 'react-css-cx';

const Container = style("div")\`
p-[5px]
\`;

export const Component = () => {
  const active = true;
  return (
    <Container className={\`mx-[5px] flex-0 grow-1 \${active ? "test-5" : "test-6"}\`} />
  );
}
`;

ruleTester.run("element-class-name=property-check", rule, {
  valid: [
    {
      code: validFile1,
      options: [],
    },
    {
      code: validFile2,
      options: [],
    },
  ],
  invalid: [
    {
      code: invalidFile1,
      errors: [
        {
          message:
            "Disallowed tailwind classes are in use in className prop: test-1",
        },
      ],
    },
    {
      code: invalidFile2,
      errors: [
        {
          message:
            "Disallowed tailwind classes are in use in className prop: test-1",
        },
      ],
    },
    {
      code: invalidFile3,
      errors: [
        {
          message:
            "Disallowed tailwind classes are in use in className prop: test-2, test-3",
        },
      ],
    },
    {
      code: invalidFile4,
      errors: [
        {
          message:
            "Disallowed tailwind classes are in use in className prop: test-4",
        },
      ],
    },
    {
      code: invalidFile5,
      errors: [
        {
          message:
            "Disallowed tailwind classes are in use in className prop: test-5, test-6",
        },
      ],
    },
  ],
});
