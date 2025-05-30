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

            const prompt = `You are a useful career guide for women in tech. A user has shared her skills and interests. Based on this, recommend 3-5 relevant certifications,
training programs, bootcamps or online courses focusing on the following areas: AI, Data, Cybersecurity, Software and Cloud.

User Input:
- Current role : ${currentRole}
- Skills: ${skills.join(",")}
- Interests: ${interests.join(",")}

Recommendations should focus on:
1. AI (Artificial Intelligence)
2. Data (Data Science, Data Engineering, Machine Learning)
3. Cybersecurity (Network Security, Ethical Hacking, Risk Management)
4. Software (Software Development, Application Development, Software Engineering)
5. Cloud (Cloud Architecture, Cloud Engineering, Cloud Security)

Provide:
1. Recommended roles or specializations within these areas
2. Specific learning resources, mentioning platforms like Microsoft Learn, Coursera, edX, AWS training and certification, etc.
3. Optional certifications that align with the areas of interest
4. A brief rationale for each recommendation

Please prioritize resources and certifications that will help user advance in these fields.
`;

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

