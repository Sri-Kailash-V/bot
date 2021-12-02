const { App } = require('@slack/bolt');
let helper = require('./helper.js');
require('isomorphic-fetch');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  // socketMode: true, // only while using socket Mode
  // appToken: process.env.PramataSocketToken, // only while using socket Mode
  logLevel: "debug"
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 6000);
  console.log('⚡️ Pramata Bot app is running!', process.env.SLACK_BOT_TOKEN, process.env.SLACK_SIGNING_SECRET,);
})();

// app.post('slack', async ({ message }) => {
//   console.log("message")
// });

app.event("app_home_opened", async ({ payload, client }) => {
  const userId = payload.user;
  try {
    // Call the views.publish method using the WebClient passed to listeners
    const result = await client.views.publish({
      user_id: userId,
      view: {
        "type": "home",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Welcome to Pramata bot, <@" + userId + "> :house:*"
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Learn how home tabs can be more useful and interactive <https://api.slack.com/surfaces/tabs/using|*in the documentation*>."
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "context",
            "elements": [
              {
                "type": "mrkdwn",
                "text": "Psssst this home tab was designed using <https://api.slack.com/tools/block-kit-builder|*Block Kit Builder*>"
              }
            ]
          }
        ]
      }
    });

    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

app.message('summary', async ({ message }) => {
  console.log(message)
  await app.client.chat.postMessage({
    channel: message.channel,
    text: "Get The Summary",
    blocks: [
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": "Get The Summary",
          "emoji": true
        }
      },
      {
        "type": "actions",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Upcomming Renewals",
              "emoji": true
            },
            "value": "Upcomming_Renewals_alert",
            "action_id": "Upcomming_Renewals_alert"
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Contract Details",
              "emoji": true
            },
            "value": "Contract_Details_info",
            "action_id": "Contract_Details_info"
          }
        ]
      }
    ]
  }).then((e)=>{console.log(e)}).catch((error)=>{console.log(error)});
});

app.message("help", async ({ message, say }) => {
  await say("Here are the commands\nType `summary` to list the Summary options\n Type `/pramata renewals` to get first 90 days renewals");
});

app.action('Upcomming_Renewals_alert', async ({ body, ack }) => {
  // Acknowledge the action
  await ack();
  await api_call({channel: body.channel.id});
});

app.shortcut("summary", async ({ body, ack, client }) => {
  await ack();
  console.log(body)
  // await say("Here are the commands\nType `summary` to list the Summary options\n Type `/pramata-renewals` to get first 90 days renewals");
  await shortcut_call({trigger_id: body.trigger_id},body.user.team_id,client);
});

app.command("/pramata", async ({ body, say,ack }) => {
  console.log(body)
  await ack();
  if (body.text === "renewals") 
    await api_call({channel: body.channel_id})
  else
    await say("Here are the commands\nType `summary` to list the Summary options\n Type `/pramata-renewals` to get first 90 days renewals");
});

async function api_call(id){
  console.log(id)
  let response = await fetch("http://localhost:5900/api/v1/get_upcomming_renewals", {
    method: "GET"
  }).then((response) => {
    if (!response.ok) {
      throw response.json();
    }
    return response.json();
  }).catch((error)=>{console.log(error)});
  await app.client.chat.postMessage({
    ...id,
    blocks: [],
    attachments: helper.attachments_blocks(response)
  }).then((e)=>{console.log(e)}).catch((error)=>{console.log(error)});
}
async function shortcut_call(id,tid,client ){
  console.log(id)
  await client.views.open({
    ...id,
    channel: tid,
    view: {
      type: "modal",
      callback_id: "summary-modal",
      title: {
        "type":"plain_text",
        "text": "Get The Summary",
      },
      submit: {
        type: "plain_text",
        text: "Submit",
      },
      close: {
        type: "plain_text",
        text: "Cancel",
      },
      blocks: [
        {
          "type": "input",
          "block_id": "Pramata_No",
          "label": {
              "type": "plain_text",
              "text": "Pramata No",
          },
          "element": {
              "type": "plain_text_input",
              "action_id": "Pramata_No"
            }
        }
      ]
    }
  }).then((e)=>{console.log(e)}).catch((error)=>{console.log(error)});
}
app.action('Pramata_No', async ({ body, ack }) => {
  console.log("here")
  // Acknowledge the action
  await ack();
  await app.client.chat.postMessage({
    ...id,
    blocks: [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": "New request",
            "emoji": true
          }
        },
        {
          "type": "section",
          "fields": [
            {
              "type": "plain_text",
              "text": "*this is plain_text text*",
              "emoji": true
            },
            {
              "type": "plain_text",
              "text": "*this is plain_text text*",
              "emoji": true
            },
            {
              "type": "plain_text",
              "text": "*this is plain_text text*",
              "emoji": true
            },
            {
              "type": "plain_text",
              "text": "*this is plain_text text*",
              "emoji": true
            }
          ]
        }
      ]
  }).then((e)=>{console.log(e)}).catch((error)=>{console.log(error)});
});