// Load the AWS SDK
const AWS = require('aws-sdk');

// Configure AWS SDK with your region
AWS.config.update({
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY
});

// Create an instance of the SES service object
const ses = new AWS.SES();

async function sendEmail({from, to, subject, text, html}) {
    // Email parameters
    const params = {
        Destination: {
            ToAddresses: to, // Replace with the recipient's email address
        },
        Message: {
            Body: {
                Html: {Data: (text || "") + (html || "")}, // Email body in plain text
            },
            Subject: {Data: subject}, // Email subject
        },
        Source: from, // Replace with your verified sender email
    };

    // Send the email
    try {
        const data = await ses.sendEmail(params).promise();
        console.log('Email sent successfully:', data);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

module.exports = {sendEmail};