/**
 * @fileoverview Enforces valid class use in inline style definitions
 * @author Alican Erdogan <https://github.com/alicanerdogan>
 */

import { Rule } from "eslint";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const DISALLOWED_TAILWIND_CLASSES = [
  "float-",
  "clear-",
  "static",
  "fixed",
  "absolute",
  "sticky",
  "inset-",
  "left-",
  "top-",
  "bottom-",
  "right-",
  "z-",
  "basis-",
  "flex-",
  "grow-",
  "shrink-",
  "order-",
  "justify-self-",
  "self-",
  "place-self-",
  "m-",
  "mx-",
  "my-",
  "ml-",
  "mt-",
  "mr-",
  "mb-",
  "snap-start",
  "snap-end",
  "snap-center",
  "snap-align-none",
  "snap-always",
  "snap-normal",
];

const REGEX_PATTERNS = DISALLOWED_TAILWIND_CLASSES.map((className) => {
  return new RegExp(`(^|:)${className}`);
});

function isValidClassName(className: string): boolean {
  return REGEX_PATTERNS.some((regex) => regex.test(className));
}

function findInvalidClassNames(classNames: string[]): string[] {
  const invalidClassNames = classNames.filter(
    (className) => !isValidClassName(className)
  );
  return invalidClassNames;
}

function tokenizeTemplateString(str: string): string[] {
  return str.replace(/\s+/g, " ").split(" ");
}

const rule: Rule.RuleModule = {
  meta: {
    // eslint-disable-next-line eslint-plugin/require-meta-docs-url
    docs: {
      description: "Enforces valid class use in inline style definitions",
      recommended: false,
    },
    schema: [],
    messages: {
      errorMsg1:
        "Disallowed tailwind classes are in use in className prop: {{ classes }}",
    },
  },

  create(context): Rule.RuleListener {
    return {
      JSXAttribute(node: any) {
        const propName = node.name?.name;

        if (propName !== "className") {
          return;
        }

        const literals = getAllLiterals(node.value).flat(5).join(" ");

        const classNames = tokenizeTemplateString(literals);
        const invalidClassNames = findInvalidClassNames(classNames);

        if (invalidClassNames.length > 0) {
          context.report({
            node,
            messageId: "errorMsg1",
            data: {
              classes: invalidClassNames.join(", "),
            },
          });
        }
      },
    };
  },
};

function getAllLiterals(node: any): string[] {
  if (node.type === "Literal") {
    return [node.value];
  }
  if (node.type === "JSXExpressionContainer") {
    return getAllLiterals(node.expression);
  }
  if (node.type === "TemplateLiteral") {
    return Array.from([...node.quasis, ...node.expressions])
      .map((node: any) => getAllLiterals(node))
      .flat(10);
  }
  if (node.type === "TemplateElement") {
    return [node.value.raw];
  }
  if (node.type === "ConditionalExpression") {
    return Array.from([node.consequent, node.alternate])
      .map((node: any) => getAllLiterals(node))
      .flat(10);
  }
  return [];
}

export = rule;
