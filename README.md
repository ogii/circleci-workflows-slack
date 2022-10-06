# CircleCI Workflow Notifications on Slack
This is a sample project to show how to send notifications at the end of CircleCI workflows to Slack.

### Prerequisites

Please make sure you have the following:

* A CircleCI account
* An aws account with access to AWS Lambda
* A Slack Bot User OAuth token with `chat:write` scope

### Installation

First clone this repository to your local machine and change into the project directory

```bash
git clone git@github.com:ogii/circleci-workflows-slack.git
cd circleci-workflows-slack
```

Next install the dependencies locally:

```bash
npm install
```

Following that, you will need to compress the files:

```bash
zip -r awslambda.zip .
```

The next step will be to upload the zip file to AWS Lambda. After creating a function in AWS Lambda, please upload the zip file via the `upload from` dropdown button.

Next, you will need to set the follow environment values under the `Configuration` tab:

| Environment Variable  |
|-----------------------|
| SLACK_ACCESS_TOKEN    |
| SLACK_API_URL         |
| SLACK_DEFAULT_CHANNEL |

where `SLACK_API_URL` is equal to `https://slack.com/api/chat.postMessage`.

Lastly, copy the `Function URL` from the function dashboard, and set the following for a webhook under the project settings page for your project on CircleCI:

* Webhook name
* Receiver URL (function URL from above)
* Secret token (if applicable)
* ✅ Certificate verification
* ✅ Workflow Completed

### Message Templates

The template is currently in `index.js`, and is defined as follows:

```javascript
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
```

### Example Screenshot

![slack](https://user-images.githubusercontent.com/640433/194282481-d6e7bd1f-31c1-4c83-b532-cb5b87d1a677.png)
