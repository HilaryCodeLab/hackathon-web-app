const { app } = require('@azure/functions');
const fetch = require('node-fetch');

app.http('fetchJobs', {
  methods: ['POST'], // <-- Changed to POST
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const reqBody = await request.json(); // <-- Parse incoming JSON
      const { job_title_or, posted_at_max_age_days = 7, job_seniority_or = [], job_country_code_or = [] } = reqBody;
      

      const response = await fetch('https://api.theirstack.com/v1/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.THEIRSTACK_API_TOKEN}`
        },
        body: JSON.stringify({
          page:0,
          limit:25,
          job_country_code_or,
          posted_at_max_age_days,
          job_title_or,
          job_seniority_or,
          order_by: [{ field: 'date_posted', desc: true }],
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

      return {
        status: 200,
        jsonBody: data
      };
    } catch (err) {
      context.log('Error fetching jobs:', err);
      return {
        status: 500,
        body: `Internal Server Error: ${err.message}`
      };
    }
  }
});
