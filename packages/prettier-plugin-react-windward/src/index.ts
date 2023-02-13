import prettier from "prettier";
import { parsers as babelParsers } from "prettier/parser-babel";
import { parsers as typescriptParsers } from "prettier/parser-typescript";
import { ParserOptions, parse as babelParser } from "@babel/parser";
import { file, TemplateLiteral, Node } from "@babel/types";
import generate from "@babel/generator";

const languages = prettier
  .getSupportInfo()
  .languages.filter(({ name }) =>
    ["JavaScript", "JSX", "TSX", "TypeScript"].includes(name),
  );

function traverse(root: any, { onVisit }: { onVisit: (node: Node) => any }) {
  function visit(node: any) {
    if (!node || typeof node.type !== "string") {
      return;
    }

    onVisit(node);

    for (const prop in node) {
      const child = node[prop];

      if (Array.isArray(child)) {
        for (let i = 0; i < child.length; i++) {
          const childNode = child[i];
          visit(childNode);
        }
      } else {
        visit(child);
      }
    }
  }

  visit(root);
}

const EMPTY_LINE_REGEX = /^\s*$/;
const DUMMY_COMMENT = "/*DUMMY_COMMENT_BY_PRETTIER_PLUGIN_FORMAT*/";
function replaceEmptyLinesWithDummyComment(
  code: string,
  ast: ReturnType<typeof babelParser>,
) {
  const stringLiteralLines = new Set();

  traverse(ast.program, {
    onVisit(node) {
      if (node.type !== "TemplateLiteral") {
        return;
      }

      const start = node.loc?.start.line;
      if (typeof start !== "number") {
        return;
      }

      const end = node.loc?.end.line || start;

      for (let i = start; i <= end; i++) {
        stringLiteralLines.add(i);
      }
    },
  });

  // Split the code into lines
  const lines = code.split("\n");
  // Replace empty lines that are not part of a multiline string literal with a comment
  const commentedLines = lines.map((line, i) => {
    const validEmptyLine = !stringLiteralLines.has(i + 1);
    if (EMPTY_LINE_REGEX.test(line) && validEmptyLine) {
      return DUMMY_COMMENT;
    }
    return line;
  });

  return commentedLines.join("\n");
}

function restoreEmptyLines(code: string) {
  return code
    .split("\n")
    .map((line) => {
      if (line.includes(DUMMY_COMMENT)) {
        return line.replace(DUMMY_COMMENT, "");
      }
      return line;
    })
    .join("\n");
}

function getImportedStyleFnLocalName(ast: ReturnType<typeof babelParser>) {
  let importedStyleFnLocalName = "";
  for (const el of ast.program.body) {
    if (el.type !== "ImportDeclaration") {
      continue;
    }
    if (el.source.value !== "react-windward") {
      continue;
    }

    for (const specifier of el.specifiers) {
      if (specifier.type !== "ImportSpecifier") {
        continue;
      }
      if (specifier.imported.type !== "Identifier") {
        continue;
      }
      if (specifier.imported.name !== "style") {
        continue;
      }
      importedStyleFnLocalName =
        specifier.local.name || specifier.imported.name;
    }
  }

  if (!importedStyleFnLocalName) {
    return null;
  }

  return importedStyleFnLocalName;
}

function getTemplateLiterals(
  ast: ReturnType<typeof babelParser>,
  importedStyleFnLocalName: string,
) {
  const templateLiterals: TemplateLiteral[] = [];
  for (const el of ast.program.body) {
    if (el.type !== "VariableDeclaration") {
      continue;
    }
    for (const decl of el.declarations) {
      if (decl.type !== "VariableDeclarator") {
        continue;
      }
      if (decl.init?.type !== "TaggedTemplateExpression") {
        continue;
      }
      if (decl.init.tag.type !== "CallExpression") {
        continue;
      }

      if (decl.init.tag.callee.type !== "Identifier") {
        continue;
      }

      if (decl.init.tag.callee.name !== importedStyleFnLocalName) {
        continue;
      }
      templateLiterals.push(decl.init.quasi);
    }
  }
  return templateLiterals;
}

function modifyTemplateLiterals(
  ast: ReturnType<typeof babelParser>,
  importedStyleFnLocalName: string,
) {
  const literals = getTemplateLiterals(ast, importedStyleFnLocalName);

  for (const literal of literals) {
    for (let i = 0; i < literal.quasis.length; i++) {
      const quasi = literal.quasis[i];
      if (quasi.type !== "TemplateElement") {
        continue;
      }
      if (quasi.value.raw !== quasi.value.cooked) {
        console.log("Unhandled case for code modification");
        continue;
      }

      const tokens: string[] = [];
      let allEmpty = true;

      const lines = quasi.value.raw.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isEmptyLine = EMPTY_LINE_REGEX.test(line);
        if ((i === 0 || i === lines.length - 1) && isEmptyLine) {
          continue;
        }
        if (isEmptyLine) {
          tokens.push("");
          continue;
        }
        for (const token of line.trim().replace(/\s+/g, " ").split(" ")) {
          allEmpty = false;
          tokens.push("  " + token);
        }
      }

      if (allEmpty) {
        quasi.value.raw = literal.quasis.length === 1 ? "" : "\n";
        continue;
      }

      const expression = literal.expressions.at(i);

      let rawQuasiValue = "";

      rawQuasiValue += "\n";
      rawQuasiValue += tokens.join("\n");
      rawQuasiValue += "\n";

      if (expression) {
        rawQuasiValue += "  ";
      }

      quasi.value.raw = rawQuasiValue;
    }
  }
}

function defaultPreprocessor(code: string, options: ParserOptions) {
  try {
    const parser = (options as any).parser;
    const isTypescriptParser = parser === "typescript";
    const parserOptions: ParserOptions = {
      sourceType: "module",
      plugins: isTypescriptParser ? ["jsx", "typescript"] : ["jsx"],
    };

    let ast = babelParser(code, parserOptions);

    const importedStyleFnLocalName = getImportedStyleFnLocalName(ast);
    if (!importedStyleFnLocalName) {
      // if the style fn is not imported, abort the process
      return code;
    }

    code = replaceEmptyLinesWithDummyComment(code, ast);
    ast = babelParser(code, parserOptions);

    modifyTemplateLiterals(ast, importedStyleFnLocalName);

    const newAST = file({
      type: "Program",
      body: ast.program.body,
      directives: ast.program.directives,
      sourceType: "module",
      sourceFile: ast.program.sourceFile,
      leadingComments: ast.program.leadingComments,
      innerComments: ast.program.innerComments,
      trailingComments: ast.program.trailingComments,
      start: null,
      end: null,
      loc: null,
    });

    const result = generate(newAST as any);
    return restoreEmptyLines(result.code);
  } catch (error) {
    console.warn("PRETTIER PLUGIN FORMAT ERROR:", error);
  }
  return code;
}

const parsers = {
  babel: {
    ...babelParsers.babel,
    preprocess: defaultPreprocessor,
  },
  typescript: {
    ...typescriptParsers.typescript,
    preprocess: defaultPreprocessor,
  },
};

const options = {};
const defaultOptions = {};

export { languages, options, parsers, defaultOptions };
