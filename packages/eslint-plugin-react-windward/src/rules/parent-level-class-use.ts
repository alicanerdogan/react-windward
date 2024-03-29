/**
 * @fileoverview Enforces valid class use in style definitions
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

const ALLOWED_TAILWIND_CLASSES = new Set(["flex-col", "flex-row"]);

const REGEX_PATTERNS = DISALLOWED_TAILWIND_CLASSES.map((className) => {
  return new RegExp(`(^|:)${className}`);
});

function isValidClassName(className: string): boolean {
  if (ALLOWED_TAILWIND_CLASSES.has(className)) {
    return true;
  }
  return REGEX_PATTERNS.every((regex) => !regex.test(className));
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

const IMPORTABLE_FUNCTIONS = ["style", "styleComponent", "classNames"];

const rule: Rule.RuleModule = {
  meta: {
    // eslint-disable-next-line eslint-plugin/require-meta-docs-url
    docs: {
      description: "Enforces valid class use in style definitions",
      recommended: false,
    },
    schema: [],
    messages: {
      errorMsg1: "Disallowed tailwind classes are in use: {{ classes }}",
    },
  },

  create(context): Rule.RuleListener {
    const importedFnNames: string[] = [];

    return {
      ImportDeclaration(node) {
        // check if the import is for 'react-windward'
        if (node.source.value === "react-windward") {
          for (const specifier of node.specifiers) {
            if (specifier.type !== "ImportSpecifier") {
              continue;
            }
            if (
              IMPORTABLE_FUNCTIONS.some(
                (fnName) => fnName === specifier.imported.name
              )
            ) {
              importedFnNames.push(specifier.local.name);
              return;
            }
          }
        }
      },
      TaggedTemplateExpression(node) {
        const hasReactCssCxImport = importedFnNames.length > 0;
        if (!hasReactCssCxImport) {
          return;
        }

        if (node.tag.type !== "CallExpression") {
          return;
        }

        if (node.tag.callee.type !== "Identifier") {
          return;
        }

        const nodeName = node.tag.callee.name;

        const notImportableFunction = importedFnNames.every(
          (fnName) => fnName !== nodeName
        );

        if (notImportableFunction) {
          return;
        }

        // Get the string literal from the template
        const templateString = node.quasi.quasis[0].value.raw;

        const classNames = tokenizeTemplateString(templateString);
        const invalidClassNames = findInvalidClassNames(classNames);

        if (invalidClassNames.length > 0) {
          context.report({
            node: node,
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

export = rule;
