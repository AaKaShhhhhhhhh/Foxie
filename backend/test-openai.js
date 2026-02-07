import dotenv from "dotenv";
dotenv.config();

const key = process.env.OPENAI_API_KEY;
if (!key) throw new Error("OPENAI_API_KEY is missing");




const r = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: "gpt-4o",
    messages: [{ role: "user", content: "Say ok" }],
    max_tokens: 10,
  }),
});

console.log(r.status);
console.log(await r.text());