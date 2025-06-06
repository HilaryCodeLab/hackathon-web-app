const { app } = require('@azure/functions');
const fetch = require('node-fetch');
const { AzureOpenAI } = require("openai");

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const apiVersion = "2024-12-01-preview";
const deployment = "gpt-4.1-nano"; // <-- use your actual deployment name

app.http('generateCareerMap', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const reqBody = await request.json();
      const {
        job_title_or,
        posted_at_max_age_days = 7,
        job_seniority_or = [],
        job_country_code_or = []
      } = reqBody;

      // Step 1: Fetch job data from TheirStack
      const response = await fetch('https://api.theirstack.com/v1/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.THEIRSTACK_API_TOKEN}`
        },
        body: JSON.stringify({
          page: 0,
          limit: 3,
          job_country_code_or,
          posted_at_max_age_days,
          job_title_or,
          job_seniority_or,
          order_by: [{ field: 'date_posted', desc: true }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          status: response.status,
          body: `TheirStack API Error: ${errorText}`
        };
      }

      const data = await response.json();
      
      // Step 2: Construct prompt
      const prompt = `
      You are an AI career advisor. Based on the following live job listings, create a visual career path using ReactFlow format (nodes and edges). The format should include:
      
      1. Node 'id' (unique string)
      2. Node 'type' (e.g., 'default')
      3. Node 'data.label' – the job title and company
      4. Node 'data.note' – a short narrative milestone or decision (e.g., "Started after bootcamp, pivoted after learning JS")
      5. Node 'data.year' – an estimated year when this role might be achieved (e.g., 2023)
      6. Node 'position' – { x, y } to lay out nodes vertically
      
      Connect jobs in logical progressions (e.g., junior → mid → senior) or by related skills.
      
      Example structure:
      {
        "nodes": [
          {
            "id": "1",
            "type": "default",
            "data": {
              "label": "Junior Frontend Developer at A",
              "note": "Started after bootcamp",
              "year": 2022
            },
            "position": { "x": 0, "y": 0 }
          },
          ...
        ],
        "edges": [
          { "id": "e1-2", "source": "1", "target": "2", "type": "smoothstep" },
          ...
        ]
      }
      
      Return ONLY valid JSON. Do NOT include:
      - Markdown formatting (no \`\`\`)
      - Comments
      - Any explanation or extra text
      
      Here are the job listings:
      ${JSON.stringify(data.data.slice(0, 3), null, 2)}
      `;
      

      const client = new AzureOpenAI({
        endpoint,
        apiKey,
        apiVersion
      });

      const gptResponse = await client.chat.completions.create({
        model: deployment,
        messages: [
          {
            role: "system",
            content: "You are an AI career advisor."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      });

      const content = gptResponse.choices[0].message.content;
      let careerMapJSON;

      // Try to parse JSON from GPT response
      try {
        careerMapJSON = JSON.parse(content);
        return {
          status: 200,
          jsonBody: careerMapJSON
        };
      } catch (jsonErr) {
        return {
          status: 500,
          body: `Failed to parse GPT response: ${jsonErr.message}\nRaw content:\n${jsonMatch[1]}`
        };
      }
    } catch (err) {
      context.log('Error generating career map:', err);
      return {
        status: 500,
        body: `Internal Server Error: ${err.message}`
      };
    }
  }
});
