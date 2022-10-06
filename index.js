const AWS = require('aws-sdk');
const axios = require('axios');

exports.handler = async (event, context) => {
  let body = JSON.parse(event.body);
  console.log(event)

  let statusCode = '200';

  const { name, status, created_at, stopped_at, url } = body.workflow;
  const { slug } = body.project;
  const { branch, target_repository_url, revision } = body.pipeline.vcs;

  
  const setStatus = status => {
    switch(status) {
      case 'success':
        return 'Workflow Succeeded 🟢'
      case 'failed':
        return 'Workflow Failed 🔴'
      case 'canceled':
        return 'Workflow Canceled ✖'
      case 'unauthorized':
        return 'Workflow Unauthorized ⚠️️'
      case 'error':
        return 'Workflow Error'
      default:
        return "none"
    }
  }
  
  let blocks = `
  [
		{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": "${setStatus(status)}",
				"emoji": true
			}
		},
		{
			"type": "section",
			"fields": [
				{
					"type": "mrkdwn",
					"text": "*Workflow:* ${name}"
				}
			]
		},
		{
			"type": "section",
			"fields": [
				{
					"type": "mrkdwn",
					"text": "*Project:* ${slug}"
				},
				{
					"type": "mrkdwn",
					"text": "*Branch:* ${branch}"
				},
				{
					"type": "mrkdwn",
					"text": "*Created:* ${created_at}"
				},
				{
					"type": "mrkdwn",
					"text": "*Finished:* ${stopped_at}"
				},
				{
					"type": "mrkdwn",
					"text": "*Commit:* <${target_repository_url}/commit/${revision}|${revision}>"
				}
			]
		},
		{
			"type": "context",
			"elements": [
				{
					"type": "mrkdwn",
					"text": "*<${url}|View the workflow on CircleCI>*"
				}
			]
		}
	]
`;
  
  const config = {
   body: {text: "CircleCI Webhook Information", blocks, channel: `${process.env.SLACK_DEFAULT_CHANNEL}`},
   url: process.env.SLACK_API_URL
  };
  
  const headers = {
    authorization: `Bearer ${process.env.SLACK_ACCESS_TOKEN}`
  };

  try {
    switch (event.requestContext.http.method) {
      case 'POST':
        try {
          const response = await axios.post(config.url, config.body, { headers });
        } catch (axiosErr) {
          throw new Error("This is the error: " + axiosErr)
        }
        break;
      case 'GET':
        body = 'You sent a GET request. Get away! parameters:' + JSON.stringify(event.queryStringParameters); 
        break;
      default:
        throw new Error(`"GET requests are not accepted"`)
    }
  } catch (err) {
    statusCode = '400';
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};
