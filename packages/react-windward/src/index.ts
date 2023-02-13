import React from "react";

type TClassArg =
  | string
  | number
  | undefined
  | null
  | false
  | Record<string, any>;

type TCXArgs = (TClassArg | TClassArg[])[];

export type ComposableStyle<TVariant> = {
  classes: string;
  fn?: TVariantFn<TVariant>;
};

export type ClassNames = TCXArgs;

export type StaticComposableStyle = string;

type TVariantFn<TVariant> = (variant: TVariant) => ClassNames;

type StyledComponentProps<
  TTag extends keyof JSX.IntrinsicElements,
  TVariant
> = JSX.IntrinsicElements[TTag] & {
  styleVariant?: TVariant;
  composedStyle?: StaticComposableStyle;
};

export interface CSSClassComponent<
  TTag extends keyof JSX.IntrinsicElements,
  TVariant extends any
> extends React.FC<StyledComponentProps<TTag, TVariant>> {}

type StyledComponentFn<
  TTag extends keyof JSX.IntrinsicElements,
  TVariant extends any
> = (
  classes: TemplateStringsArray,
  ...args: (string | StaticComposableStyle)[]
) => CSSClassComponent<TTag, TVariant>;

type StyledExistingComponentProps<TProps extends any, TVariant> = TProps & {
  styleVariant?: TVariant;
  composedStyle?: StaticComposableStyle;
};

export interface CSSClassExistingComponent<
  TProps extends any,
  TVariant extends any
> extends React.FC<StyledExistingComponentProps<TProps, TVariant>> {}

type StyledExistingComponentFn<TProps extends any, TVariant extends any> = (
  classes: TemplateStringsArray,
  ...args: (string | StaticComposableStyle)[]
) => CSSClassExistingComponent<TProps, TVariant>;

function concat(
  strings: TemplateStringsArray,
  ...args: (string | StaticComposableStyle)[]
): string {
  let classes = "";

  let i = 0;
  while (args[i] || strings[i]) {
    const str = strings[i];
    if (str) {
      classes += str;
    }

    const arg = args[i];
    if (arg) {
      classes += arg;
    }

    i += 1;
  }

  return classes;
}

export function cx(...args: TCXArgs): string {
  const classes: string[] = [];

  for (const arg of args) {
    if (!arg) continue;

    const argType = typeof arg;

    if (argType === "string" || argType === "number") {
      classes.push(arg.toString());
      continue;
    }

    if (Array.isArray(arg) && arg.length > 0) {
      const inner = cx(arg);
      if (inner) {
        classes.push(inner);
      }
      continue;
    }

    Object.entries(arg)
      .filter(([, value]) => !!value)
      .forEach(([key]) => classes.push(key));
  }

  return classes.join(" ").trimEnd().trimStart().replace(/\n/g, " ");
}

function createElement(
  classes: TemplateStringsArray,
  args: (string | StaticComposableStyle)[],
  fn: any,
  type: any
): any {
  const concatClasses = concat(classes, ...args);

  const ReturnedComponent = React.forwardRef(
    ({ styleVariant, className, composedStyle, ...props }: any, ref: any) => {
      let newFn: any = fn;
      const dynamicClasses = newFn ? newFn(styleVariant || {}) : [];
      const newClassName = cx(
        concatClasses,
        ...dynamicClasses,
        composedStyle,
        className
      );

      return React.createElement(type, {
        ...props,
        className: newClassName,
        ref,
      });
    }
  ) as any;

  ReturnedComponent.displayName =
    typeof type === "string" ? `styled-${type}` : `styled-component`;
  ReturnedComponent.__styles = { classes, fn };
  return ReturnedComponent;
}

export function style<
  TTag extends keyof JSX.IntrinsicElements,
  TVariant extends any
>(type: TTag, fn?: TVariantFn<TVariant>): StyledComponentFn<TTag, TVariant> {
  return (
    classes: TemplateStringsArray,
    ...args: (string | StaticComposableStyle)[]
  ): CSSClassComponent<TTag, TVariant> => {
    return createElement(classes, args, fn, type);
  };
}

export function styleComponent<TProps extends any, TVariant extends any>(
  BaseComponent: React.FC<TProps>,
  fn?: TVariantFn<TVariant>
): StyledExistingComponentFn<TProps, TVariant> {
  return (
    classes: TemplateStringsArray,
    ...args: (string | StaticComposableStyle)[]
  ): CSSClassExistingComponent<TProps, TVariant> => {
    return createElement(classes, args, fn, BaseComponent);
  };
}

export function extendStyled<
  TTag extends keyof JSX.IntrinsicElements,
  TVariantBase extends any,
  TVariant extends any
>(
  BaseComponent: CSSClassComponent<any, TVariantBase>,
  type: TTag,
  fn?: TVariantFn<TVariant>
) {
  const {
    __styles: { classes: baseClasses, fn: baseFn },
  } = BaseComponent as any;
  const ComposedComponentFn: any = (classes: any) => {
    const newClasses = [...baseClasses, ...classes];
    let newFn: any = fn;
    if (baseFn) {
      if (fn) {
        newFn = (variant: any) => {
          return [...baseFn(variant || {}), ...fn(variant || {})];
        };
      } else {
        newFn = baseFn;
      }
    }

    return style(type as any, newFn)(newClasses as any) as any;
  };

  return ComposedComponentFn as StyledComponentFn<
    TTag,
    TVariantBase & TVariant
  >;
}
