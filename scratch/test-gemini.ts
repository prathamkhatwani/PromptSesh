import dotenv from "dotenv";
dotenv.config();

async function testKey() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  console.log("Key from env:", apiKey ? `${apiKey.substring(0, 10)}...` : "UNDEFINED");

  if (!apiKey) {
    console.error("No key found in environment variables!");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello, reply with 'Hello World'" }] }],
      }),
    });

    const status = response.status;
    const body = await response.text();

    console.log(`Response Status: ${status}`);
    console.log(`Response Body: ${body}`);
  } catch (error) {
    console.error("Fetch request failed:", error);
  }
}

testKey();
