// Temporary shims to satisfy TypeScript in this environment when React types
// are not installed. These should be removed when proper @types/react is added.

declare module "react" {
  export const useState: any;
  export const useEffect: any;
  export const useRef: any;
  const React: any;
  export default React;
}

declare module "react/jsx-runtime" {
  export function jsx(type: any, props?: any, key?: any): any;
  export function jsxs(type: any, props?: any, key?: any): any;
  export const Fragment: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
