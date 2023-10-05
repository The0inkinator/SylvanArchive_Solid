export function GET() {
  const data = { image: "example.jpg" };

  const json = JSON.stringify(data);

  return new Response(json, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
