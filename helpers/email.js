const nodeMailer = require("nodemailer");

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Fannelance</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .image-container {
            text-align: center;
            margin-bottom: 20px;
        }
        .image-container img {
            max-width: 30%;
            height: auto;
            border-radius: 50%;
        }
        .header {
            text-align: left;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #333333;
        }
        .content {
            text-align: left;
            margin-bottom: 20px;
        }
        .content p {
            margin: 0 0 10px;
            color: #555555;
            font-size: 16px;
        }
        .content ul {
            padding-left: 50; 
            list-style-type: circle;
        }
        .content ul li {
            position: relative; 
            padding-left: 10;
            margin-bottom: 5px; 
            color: #333333;
            font-size: 16px;
        }
        .footer {
            text-align: left;
            font-size: 14px;
            color: #aaaaaa;
        }
        /* Responsive Design */
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 90%;
                margin: 10px auto;
                padding: 10px;
            }
            .header h1 {
                font-size: 20px;
            }
            .content p {
                font-size: 14px;
            }
            .footer p {
              font-size: 10px;
            } 
            .content ul li {
                font-size: 14px;
                padding-left: 5px; /* Adjust padding for smaller screens */
            }
            .content ul li::before {
                font-size: 18px;
            }
        }
        @media only screen and (max-width: 400px) {
            .header h1 {
                font-size: 18px;
            }
            .content p, .footer p {
                font-size: 14px;
            }
            .content ul li {
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Image Section -->
        <div class="image-container">
            <img src="https://drive.google.com/thumbnail?id=1P_PlAK4JvthMkd8WZasUeqwA1LufKfnx" alt="Fannelance Logo">
        </div>
        
        <div class="header">
            <h1>Welcome to Fannelance! 🎉</h1>
        </div>
        
        <div class="content">
            <p>We're delighted to have you with us. Your account creation was successful. Begin your journey with us and feel free to reach out if you need any assistance.</p>
            <p>We’re happy to have you on board. With Fannelance, you can:</p>
            <ul>
                <li>You could easily search for and connect with skilled maintenance workers.</li>
                <li>Collaborate with workers members seamlessly</li>
                <li>Secure payment gateway for processing transactions</li>
            </ul>
            <p>And much more!</p>
        </div>
        
        <div class="footer">
            <p>Thank you for joining us,<br>
            The Fannelance Team</p>
        </div>
    </div>
</body>
</html>
`;

exports.sendWelcomingMail = async function (firstname, email) {
  const transporter = nodeMailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailoptions = {
    from: { name: "Fannelance", address: process.env.EMAIL },
    to: email,
    subject: `Hooray, you're in! 🌟`,
    html: html.replace("{{to_name}}", firstname.toUpperCase()),
  };

  transporter.sendMail(mailoptions, function (err, info) {
    if (err) {
      console.error(err);
    } else {
      console.log("Email sent: " + info.messageId);
    }
  });
};
