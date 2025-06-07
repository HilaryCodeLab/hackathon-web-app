const { AzureOpenAI } = require("openai");
const { app } = require('@azure/functions');

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const apiVersion = "2024-12-01-preview";
const deployment = "gpt-4.1-nano";
const modelName = "gpt-4.1-nano";


app.http("message", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: async (request, context) => {
        try {
            const body = await request.json();
            const { skills, interests, currentRole } = body;
            const client = new AzureOpenAI({
                endpoint,
                apiKey,
                apiVersion,
                deployment
            });

            const prompt = `You are a helpful career guide for women in tech. A user has shared her skills and interests. Based on this, recommend 3–5 relevant certifications, training programs, bootcamps, or online courses in these areas:

- AI (Artificial Intelligence)
- Data (Data Science, Data Engineering, Machine Learning)
- Cybersecurity (Network Security, Ethical Hacking, Risk Management)
- Software (Software Development, Application Development, Software Engineering)
- Cloud (Cloud Architecture, Cloud Engineering, Cloud Security)

User Input:
- Current role: ${currentRole}
- Skills: ${skills.join(", ")}
- Interests: ${interests.join(", ")}

Please provide:
- Recommended roles or specializations aligned with the user's skills/interests
- Specific learning resources (e.g., Microsoft Learn, Coursera, edX, AWS Training, etc.)
- Optional certifications that support career advancement
- A short, clear rationale for each recommendation

**Format your response as a numbered list, using this style:**

1. [Title]: [Short recommendation and platform]. [Optional certification].  
   [One-sentence rationale].

2. [Title]: ...

**Add two line breaks (\\n\\n) between each numbered item for clarity. Keep it concise.**`;


            const response = await client.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a helpful career advisor for women in tech." },
                    { role: "user", content: prompt }
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

