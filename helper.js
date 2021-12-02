var moment = require('moment');

module.exports.attachments_blocks = (data) =>{
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