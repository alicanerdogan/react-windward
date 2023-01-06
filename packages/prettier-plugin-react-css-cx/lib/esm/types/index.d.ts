import prettier from "prettier";
import { ParserOptions } from "@babel/parser";
declare const languages: prettier.SupportLanguage[];
declare function defaultPreprocessor(code: string, options: ParserOptions): string | undefined;
declare const parsers: {
    babel: {
        preprocess: typeof defaultPreprocessor;
        parse: (text: string, parsers: {
            [parserName: string]: prettier.Parser<any>;
        }, options: prettier.ParserOptions<any>) => any;
        astFormat: string;
        hasPragma?: ((text: string) => boolean) | undefined;
        locStart: (node: any) => number;
        locEnd: (node: any) => number;
    };
    typescript: {
        preprocess: typeof defaultPreprocessor;
        parse: (text: string, parsers: {
            [parserName: string]: prettier.Parser<any>;
        }, options: prettier.ParserOptions<any>) => any;
        astFormat: string;
        hasPragma?: ((text: string) => boolean) | undefined;
        locStart: (node: any) => number;
        locEnd: (node: any) => number;
    };
};
declare const options: {};
declare const defaultOptions: {};
export { languages, options, parsers, defaultOptions };
//# sourceMappingURL=index.d.ts.map