const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URI));
const axios = require("axios");

const ETHER_GAS_STATION_API = "https://ethgasstation.info/api/ethgasAPI.json";
const ENS_REGISTRY_ABI_JSON = require("../contracts/publicResolverAbi.json");
const ENS_NODE =
  "0x551374b3400bcdcb1e816b08bd1f3d132b8f34cf35197cf90ed97c7f8b28074b";
let ENS_REGISTRY_ADDRESS = "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41";

// ropsten ens address
if (process.env.INFURA_URI.includes("ropsten")) {
  ENS_REGISTRY_ADDRESS = "0x42D63ae25990889E35F215bC95884039Ba354115";
}

const ethDomainAccount = web3.eth.accounts.privateKeyToAccount(
  process.env.ETH_MYPASS_DOMAIN_PRIVATE_KEY
);

web3.eth.accounts.wallet.add(ethDomainAccount);

const ensContract = new web3.eth.Contract(
  JSON.parse(ENS_REGISTRY_ABI_JSON.result),
  ENS_REGISTRY_ADDRESS
);

class EthereumBlockchainClient {
  async createNewDID() {
    const account = web3.eth.accounts.create();
    const privKeyWithoutHeader = account.privateKey.substring(2);
    let did = {
      didAddress: account.address,
      didPrivateKey: privKeyWithoutHeader,
    };
    return did;
  }

  async setTxtRecord(didKey, nameValue) {
    let gasEstimate = await ensContract.methods
      .setText(ENS_NODE, didKey, nameValue)
      .estimateGas({ from: ethDomainAccount.address });

    let gasStationPrice = await axios.get(ETHER_GAS_STATION_API);

    console.log(
      "Starting Set Txt Record With Eth Domain Address: " +
        ethDomainAccount.address +
        " with value: " +
        nameValue
    );
    try {
      await ensContract.methods.setText(ENS_NODE, didKey, nameValue).send({
        from: ethDomainAccount.address,
        gasPrice: 100000000 * (gasStationPrice.data.safeLow / 10),
        gas: gasEstimate,
      });
    } catch (err) {
      console.log("Ens Contract Error:");
      console.log(err);
    }
  }

  async getTxtRecord(didKey) {
    let res = await ensContract.methods.text(ENS_NODE, didKey).call();
    return res;
  }
}

module.exports = EthereumBlockchainClient;
