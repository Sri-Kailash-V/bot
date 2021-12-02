const { App } = require('@slack/bolt');
var moment = require('moment');
require('isomorphic-fetch');
// const https = require('https');
// const yourWebHookURL=process.env.WebHookURL;
// const userAccountNotification = {
//   'username': 'server notifier', // This will appear as user name who posts the message
//   'text': 'App is up', // text
// };

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.PramataSocketToken,
  // logLevel: "debug"
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 6000);
  // const slackResponse = await sendSlackMessage(yourWebHookURL, userAccountNotification);
  // console.log('Message response', slackResponse);
  console.log('⚡️ Bolt app is running!');
  // findConversation()
})();

app.event("app_home_opened", async ({ payload, client }) => {
  // console.log(payload)
  // console.log(client)
  const userId = payload.user;
  try {
    // Call the views.publish method using the WebClient passed to listeners
    const result = await client.views.publish({
      user_id: userId,
      view: {
        // Home tabs must be enabled in your app configuration page under "App Home"
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

app.action('Upcomming_Renewals_alert', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  let response = await fetch("http://localhost:5900/api/v1/get_upcomming_renewals", {
    method: "GET"
  }).then((response) => {
    if (!response.ok) {
      throw response.json();
    }
    return response.json();
  })
  .catch((error)=>{console.log(error)
  });
  console.log(body)
  res(body,response)
  // // await app.client.chat.postMessage({
  //   channel: body.channel.id,
  //   text: "Upcomming Renewals alert list",
  //   attachments: attachments_blocks(response)
  // }).then((e)=>{console.log(e)}).catch((error)=>{console.log(error)});
// a= {  text: "Upcomming Renewals alert list",
//   attachments: }
  // await say(a);
});
async function res(request,response){
  console.log(request)
  // let q=attachments("90",response.next_60,"#d92e2e")
  await app.client.chat.postMessage({
    channel: request.channel.id,
    // text: "Upcomming Renewals alert list",
    blocks: [],
    attachments: attachments_blocks(response)
  }).then((e)=>{console.log(e)}).catch((error)=>{console.log(error)});
}

function attachments_blocks(data){
  let attach = [];
  attach = attach.concat(attachments("30",data.next_30,"#fa0000"));
  attach = attach.concat(attachments("60",data.next_60,"#fafa00"));
  attach = attach.concat(attachments("90",data.next_90,"#00ff37"));
  return attach
}

function pramata_date(date){
  return date? moment(date).format("MMM D, YYYY") : "-"
}
function content(data){
  return [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `<${data.contract_url} | *${data.pramata_number} - ${data.document_title}*>`
      },
    },
    {
      "type": "section",
      "text": 
        {
          "type": "mrkdwn",
          "text": `_Customer Name:_ *${data.customer_name}*    _Contract Type:_ *${data.contract_type}*\n _End Date:_ *${pramata_date(data.end_date)}*   _Notice Date:_ *${pramata_date(data.notice_date)}*   _Days Left:_ \`${data.days_left_for_notice_date}\``
        }
      
    }
  ]
}
function attachments(limit,data,color){
  attachment = []
  let header = {
    color: color,
    blocks: [
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": `Contracts to take action in the next ${limit} Days`
        }
      },
    ]
  };

  attachment.push(header);
  for (let col of data){
    attachment.push({ color: color, blocks: content(col)});
  }
  return attachment;
}

app.message(/^(hi|hey).*/, async ({ context, say }) => {
  // RegExp matches are inside of context.matches
  const greeting = context.matches[0];
  console.log(context)
  await say(`${greeting}, how are you?`);
});
app.message('hello', async ({ message, say }) => {
  console.log(message)
  // say() sends a message to the channel where the event was triggered
  let ts,channel;
  // await say({
  //   blocks: [
  //     {
  //       "type": "section",
  //       "text": {
  //         "type": "mrkdwn",
  //         "text": `Hey there <@${message.user}> you are in <@${message.channel}>!`
  //       },
  //       "accessory": {
  //         "type": "button",
  //         "text": {
  //           "type": "plain_text",
  //           "text": "Click Me"
  //         },
  //         "action_id": "button_click"
  //       }
  //     }
  //   ],
  //   text: `Hey there <@${message.user}> you are in <@${message.channel}>!`
  // });
  // let d = new Date();
  // d.setMinutes(21);
  // await app.client.chat.scheduleMessage({
  //   channel: message.channel,
  //   text: "welcome",
  //   post_at: Math.floor(d.getTime() /1000)
  // }).then((e)=>{console.log(e)}).catch((error)=>{console.log(error)});
  // await app.client.users.list().then((e)=> console.log(e))
  // await app.client.users.info({
  //   user: a.members[2].id
  
   await app.client.chat.postMessage({
    channel: message.channel,
    test: "welcome",
    "blocks" :[
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": "Action Required on Following Renewals",
          "emoji": true
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `<https://data.contract_url.com | *{data.document_title}*>`
        },
      // },
      // {
      //   "type": "section",
        "fields": [
          {
            "type": "mrkdwn",
            "text": `>*Customer Name*\n>{data.customer_name}\n>*End Date*\n>$data.end_date}`
          },
          {
            "type": "mrkdwn",
            "text": `>*Notice Date*\n>{data.notice_date}\n>*Days Left*\n>{data.days_left_for_notice_date}`
          },
        ]
      },
      {
        "type": "context",
        "elements": [
          {
            "type": "plain_text",
            "text": "{data.pramata_number} | {data.contract_type} Contract"
          }
        ]
      }
    ]

    // "color": "#53c4f5",
    // text: "*This* _is_ ~unquoted~ `text`\n>```This``` • is \n• quoted text\n <http://example.com> <http://example.com/|This>  <mailto:bob@example.com|is> "+`~_*welcome*_~ to <#${message.channel}>\n> <http://example.com|example link> http://example.com #general @here 🤩 :smile: `,
    // user: message.user,
  // }).then((e)=>{ts = e.message.ts;console.log(e)}).catch((error)=>{console.log(error)});
  // await app.client.chat.update({     // update the chat
  //     channel: message.channel,
  //     text: `what can i do <@${message.user}>:wave: ?`,
  //     ts: ts
  // }).then((e)=>{console.log(e)}).catch((error)=>{console.log(error)});

  // await app.client.chat.delete({       // delete the chat
  //   channel: message.channel,
  //   ts: ts
  // }).then((e)=>{console.log(e)}).catch((error)=>{console.log(error)});

  // await app.client.chat.postMessage({
  // channel: message.channel,
  // text: "what can i do :wave: ?",
  // thread_ts: ts,                         //replay in thread
  //  // reply_broadcast: true              //replay in thread ans post in channel
  // }).then((e)=>{console.log(e)}).catch((error)=>{console.log(error)});
  }).then((e)=>{console.log(e)}).catch((error)=>{console.log(error)});

});

app.action('button_click', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
});

function sendSlackMessage (webhookURL, messageBody) {
  // make sure the incoming message body can be parsed into valid JSON
  try {
    messageBody = JSON.stringify(messageBody);
  } catch (e) {
    throw new Error('Failed to stringify messageBody', e);
  }

  // Promisify the https.request
  return new Promise((resolve, reject) => {
    // general request options, we defined that it's a POST request and content is JSON
    const requestOptions = {
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      }
    };

    // actual request
    const req = https.request(webhookURL, requestOptions, (res) => {
      let response = '';
      res.on('data', (d) => {
        response += d;
      });
      // response finished, resolve the promise with data
      res.on('end', () => {
        resolve(response);
      })
    });

    // there was an error, reject the promise
    req.on('error', (e) => {
      reject(e);
    });

    // send our message body (was parsed to JSON beforehand)
    req.write(messageBody);
    req.end();
  });
}


async function findConversation() {
  try {
    // Call the conversations.list method using the built-in WebClient
    const result = await app.client.conversations.list();

    for (const channel of result.channels) {
      console.log("Found channel "+ channel.name+ "----"+ channel.id);
      if (channel.name !== "random") { continue }
      await app.client.conversations.history({
        channel: channel.id,
        limit: 2
      }).then((result) => {
        console.log(result.messages)
        for (const message of result.messages) {
          app.client.conversations.replies({
            channel: channel.id,
            ts: message.ts}
            ).then((result) => {
              result? console.log(result) :"";
            }).catch((error)=> console.log(error));
          }
      }).catch((error)=> console.log(error));
    }
  } catch (error) {
    console.error(error);
  }
}
  
// app.app_metion( async ({ context, say })=>{
//   await say(`${greeting}, how are you?`);
// });
