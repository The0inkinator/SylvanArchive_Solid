import { connectToDB } from "../../backend/dbConnect";

export function GET() {
  const data = connectToDB();

  const json = JSON.stringify(data);

  return new Response(json, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
