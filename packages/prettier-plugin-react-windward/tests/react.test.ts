import prettier from "prettier";
import type { ParserOptions } from "prettier";

function subject(code: string, options: Partial<ParserOptions> = {}) {
  return prettier.format(code, {
    plugins: ["."],
    jsdocSpaces: 1,
    parser: "typescript",
    ...options,
  } as ParserOptions);
}

const unformattedFile1 = `
import { style } from 'react-windward';

const Container = style("div")\`
p-[5px]
text-blue-500
\`;

export const Component = () => {
  return (
    <Container className="mx-[5px]" />
  );
}
`;

const formattedFile1 = `import { style } from "react-windward";

const Container = style("div")\`
  p-[5px]
  text-blue-500
\`;

export const Component = () => {
  return <Container className="mx-[5px]" />;
};
`;

const unformattedFile2 = `
import { style } from 'react-windward';

const Container = style("div")\`
p-[5px]
text-blue-500
\${(() => \`test\`)()}
p-[5px]
text-blue-500
\${(() => \`test\`)()}

p-[5px]
text-blue-500
    \${(() => \`test\`)()}
\`;

export const Component = () => {
  return (
    <Container className="mx-[5px]" />
  );
}
`;

const formattedFile2 = `import { style } from "react-windward";

const Container = style("div")\`
  p-[5px]
  text-blue-500
  \${(() => \`test\`)()}
  p-[5px]
  text-blue-500
  \${(() => \`test\`)()}

  p-[5px]
  text-blue-500
  \${(() => \`test\`)()}
\`;

export const Component = () => {
  return <Container className="mx-[5px]" />;
};
`;

const unformattedFile3 = `
import { style } from 'react-windward';

const Container = style("div")\`
p-[5px]
text-blue-500
  
text-[14px]
leading-[20px]
\`;

export const Component = () => {
  return (
    <Container className="mx-[5px]" />
  );
}
`;

const formattedFile3 = `import { style } from "react-windward";

const Container = style("div")\`
  p-[5px]
  text-blue-500

  text-[14px]
  leading-[20px]
\`;

export const Component = () => {
  return <Container className="mx-[5px]" />;
};
`;

const unformattedFile4 = `
import { style } from 'react-windward';

const Container = style("div")\`p-[5px] text-blue-500
text-[14px] leading-[20px]
\`;

export const Component = () => {
  return (
    <Container className="mx-[5px]" />
  );
}
`;

const formattedFile4 = `import { style } from "react-windward";

const Container = style("div")\`
  p-[5px]
  text-blue-500
  text-[14px]
  leading-[20px]
\`;

export const Component = () => {
  return <Container className="mx-[5px]" />;
};
`;

const unformattedFile5 = `
import { style } from 'react-windward';

const Container = style("div")\`
  
\`;

export const Component = () => {
  return (
    <Container className="mx-[5px]" />
  );
}
`;

const formattedFile5 = `import { style } from "react-windward";

const Container = style("div")\`\`;

export const Component = () => {
  return <Container className="mx-[5px]" />;
};
`;

const unformattedFile6 = `
import { style } from 'react-windward';

const Container = style("div")\`
  
\`;

export const Component = () => {
  const a = 1;

  return (
    <Container className="mx-[5px]" />
  );
}
`;

const formattedFile6 = `import { style } from "react-windward";

const Container = style("div")\`\`;

export const Component = () => {
  const a = 1;

  return <Container className="mx-[5px]" />;
};
`;

const unformattedFile7 = `
import { styleComponent } from 'react-windward';
import { Link } from '@remix-run/react';

const Container = styleComponent(Link)\`p-[5px] text-blue-500
text-[14px] leading-[20px]
\`;

export const Component = () => {
  return (
    <Container className="mx-[5px]" />
  );
}
`;

const formattedFile7 = `import { styleComponent } from "react-windward";
import { Link } from "@remix-run/react";

const Container = styleComponent(Link)\`
  p-[5px]
  text-blue-500
  text-[14px]
  leading-[20px]
\`;

export const Component = () => {
  return <Container className="mx-[5px]" />;
};
`;

describe("React files formatting", () => {
  test("should apply padding to the simple literal", () => {
    const result = subject(unformattedFile1);
    expect(result).toEqual(formattedFile1);
  });

  test("should apply padding to the string literal with interpolation", () => {
    const result = subject(unformattedFile2);
    expect(result).toEqual(formattedFile2);
  });

  test("should contain the empty lines", () => {
    const result = subject(unformattedFile3);
    expect(result).toEqual(formattedFile3);
  });

  test("should split lines with more than one classes", () => {
    const result = subject(unformattedFile4);
    expect(result).toEqual(formattedFile4);
  });

  test("should handle empty content", () => {
    const result = subject(unformattedFile5);
    expect(result).toEqual(formattedFile5);
  });

  test("should be able to format a complex file", () => {
    const result = subject(unformattedFile6);
    expect(result).toEqual(formattedFile6);
  });

  test("should be able to format styles for styleComponent", () => {
    const result = subject(unformattedFile7);
    expect(result).toEqual(formattedFile7);
  });
});
