// Temporary development shims to help the TypeScript compiler in the IDE.
// Install proper @types/* packages for production use.

declare module "react-router" {
  export function json(body: any, init?: any): any;
  export type ActionArgs = any;
}

declare module "@react-router/dev/routes" {
  export type RouteConfig = any;
  export function index(p: string): any;
}

declare const process: any;
