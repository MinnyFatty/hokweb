export class Contacts {
  state: any;
  env: any;
  constructor(state: any, env: any) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request) {
    try {
      const url = new URL(request.url);
      if (request.method === "POST" && url.pathname.endsWith("/save")) {
        const data = await request.json();
        const id = `contact:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
        await this.state.storage.put(id, data);
        return new Response(JSON.stringify({ ok: true, id }), { headers: { "Content-Type": "application/json" } });
      }

      if (request.method === "GET" && url.pathname.endsWith("/list")) {
        const map = await this.state.storage.list();
        const out: any[] = [];
        for (const [k, v] of map) {
          out.push({ key: k, value: v });
        }
        return new Response(JSON.stringify(out), { headers: { "Content-Type": "application/json" } });
      }

      return new Response("Not found", { status: 404 });
    } catch (err: any) {
      console.error(err);
      return new Response(JSON.stringify({ ok: false, error: err?.message ?? String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  }
}
