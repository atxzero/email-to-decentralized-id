const ip = require("ip");

class EmailUtil {
  async sendEmail(emailAddress, uuid) {
    try {
      const send = require("gmail-send")({
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
        to: emailAddress,
        subject: `Email to decentralized identity (DID) service`,
      });

      send(
        {
          // eslint-disable-next-line
          text: `This is a one time link to verify that you claimed the private key to link to this email: ${ip.address()}:5004/api/private-key-from-guid/${uuid}`,
        },
        (error, result, fullResult) => {
          if (error) console.error(error);
          console.log(result);
        }
      );
    } catch (err) {
      console.log("error!");
      console.log(err);
      res.status(500).json({ message: "failure" });
    }

    console.log("sent email to: " + emailAddress);
  }
}

module.exports = EmailUtil;
