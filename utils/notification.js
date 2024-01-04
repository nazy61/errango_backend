const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: "AKIAUOI4X6PKJGZ3HXGR",
  secretAccessKey: "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",
  region: "us-east-1",
});

const ses = new AWS.SES();
const sns = new AWS.SNS();

module.exports.send_email = async () => {
  const params = {
    Destination: {
      ToAddresses: ["meabout9@gmail.com"],
    },
    Message: {
      Body: {
        Text: {
          Data: "This is the email body.",
        },
      },
      Subject: {
        Data: "Subject of the email",
      },
    },
    Source: "algobuds@gmail.com",
  };

  ses.sendEmail(params, (err, data) => {
    if (err) console.error(err);
    else console.log("Email sent:", data);
  });
};

module.exports.send_sms = async (destination, message) => {
  const params = {
    Message: message,
    PhoneNumber: destination,
    // Recipient's phone number
    MessageAttributes: {
      "AWS.SNS.SMS.SenderID": {
        DataType: "String",
        StringValue: "Errango", // Your custom Sender ID
      },
      "AWS.SNS.SMS.SMSType": {
        DataType: "String",
        StringValue: "Transactional", // or 'Promotional'
      },
    },
  };

  sns.publish(params, (err, data) => {
    if (err) console.error(err);
    else console.log("SMS sent:", data);
  });
};
