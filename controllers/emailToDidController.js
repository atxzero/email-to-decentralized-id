const express = require("express");
const emailToDidController = express.Router();
const { v4: uuidv4 } = require("uuid");
const EthereumBlockchainClient = require("../blockchain/EthereumBlockchainClient");
const EmailUtil = require("../util/EmailUtil");
const NodeCache = require("node-cache");

const ethClient = new EthereumBlockchainClient();
const emailUtil = new EmailUtil();

// 1 hour ttl
const keyCache = new NodeCache({ stdTTL: 60 * 60, checkperiod: 60 * 60 });

emailToDidController.post("/generate-email-did", async function (req, res) {
  let did;
  const emailDid = await ethClient.getTxtRecord(req.body.email);

  if (emailDid === undefined || emailDid === "") {
    did = await ethClient.createNewDID();
    const uuid = uuidv4();

    const keyCahceValue = { did: did, email: req.body.email };

    console.log({ keyCahceValue });

    keyCache.set(uuid, keyCahceValue);
    emailUtil.sendEmail(req.body.email, uuid);
  } else {
    did = { didAddress: emailDid };
  }

  // Remove private key for custodian
  if (req.body.custodian === true) {
    did = { didAddress: did.didAddress };
  }

  res.status(200).json(did);
});

emailToDidController.get("/private-key-from-guid/:uuid", async function (
  req,
  res
) {
  const keyCahceValue = keyCache.take(req.params.uuid);
  // only set txt record if did is not undefined
  if (keyCahceValue !== undefined) {
    ethClient.setTxtRecord(keyCahceValue.email, keyCahceValue.did.didAddress);
  }

  res.status(200).json(keyCahceValue);
});

emailToDidController.get("/generate-document-did", async function (req, res) {
  did = await ethClient.createNewDID();
  res.status(200).json(did);
});

emailToDidController.get("/get-txt-record/:didkey", async function (req, res) {
  did = await ethClient.getTxtRecord(req.params.didkey);
  res.status(200).json(did);
});

module.exports = emailToDidController;
