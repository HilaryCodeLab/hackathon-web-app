const { AzureOpenAI } = require("openai");
const { app } = require('@azure/functions');

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const apiVersion = "2024-04-01-preview";
const deployment = "gpt-4";
const modelName = "gpt-4";


app.http("message", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: async (request, context) => {
      try {
        const body = await request.json();
        const userMessage = body.message;
  
        const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
  
        const response = await client.chat.completions.create({
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: userMessage }
          ],
          max_tokens: 4096,
          temperature: 1,
          top_p: 1,
          model: modelName
        });
  
        return {
          status: 200,
          jsonBody: { reply: response.choices[0].message.content }
        };
      } catch (error) {
        context.log.error("Error calling OpenAI:", error);
        return {
          status: 500,
          jsonBody: { error: "Something went wrong while calling OpenAI." }
        };
      }
    }
  });

