import server$ from "solid-start/server";

export function GET() {
  const data = { 1: 1 };

  const json = JSON.stringify(data);

  return new Response(json, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
