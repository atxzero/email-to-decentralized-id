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

emailToDidController.post("/store-jwt/", async function (req, res) {
  let didUrl;
  let resolverUrl;
  const now = new Date();
  const vcJwt = req.body.vcJwt;
  const network = req.body.network;
  const documentDidPrivateKey = req.body.documentDidPrivateKey;

  const vcUnpacked = await ethClient.verifyVC(vcJwt);
  const documentDidAddress = vcUnpacked.payload.vc.id.split(":")[2];
  const expirationDate = new Date(vcUnpacked.payload.vc.expirationDate);
  const validityTimeSeconds = Math.round((expirationDate - now) / 1000);

  if (network === "eth-testnet") {
    didUrl = "https://ropsten.etherscan.io/address/" + documentDidAddress;
    resolverUrl =
      "https://dev.uniresolver.io/1.0/identifiers/did%3Aethr%3Aropsten%3A" +
      documentDidAddress;
  } else if (network === "eth-mainnet") {
    didUrl = "https://etherscan.io/address/" + documentDidAddress;
    resolverUrl =
      "https://dev.uniresolver.io/1.0/identifiers/did%3Aethr%3A" +
      documentDidAddress;
  }

  // mainnet vs testnet are from the .env infura provider.
  ethClient.storeDataOnEthereumBlockchain(
    documentDidAddress,
    documentDidPrivateKey,
    validityTimeSeconds,
    vcJwt
  );

  res.status(200).json({ didUrl, resolverUrl });
});

module.exports = emailToDidController;
