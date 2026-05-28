require("dotenv").config();

const axios = require("axios");
const chalk = require("chalk");
const bs58 = require("bs58").default;

const {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");

const connection = new Connection(
  process.env.HELIUS_RPC_URL
);

const agentWallet = Keypair.fromSecretKey(
  bs58.decode(process.env.AGENT_PRIVATE_KEY)
);

async function payRecipient(recipient) {

  console.log(
    chalk.cyan("\n[3] Sending payment...\n")
  );

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: agentWallet.publicKey,
      toPubkey: new PublicKey(recipient),
      lamports: 1000000,
    })
  );

  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [agentWallet]
  );

  console.log(
    chalk.green("[4] Payment successful\n")
  );

  console.log(
    chalk.yellow("TX Signature:")
  );

  console.log(signature);

  return signature;
}

async function verifyPayment(signature) {

  console.log(
    chalk.cyan("\n[5] Verifying payment...\n")
  );

  const response = await axios.post(
    `${process.env.PUBLISHER_URL}/verify`,
    {
      signature,
    }
  );

  console.log(
    chalk.green("[6] Verification complete\n")
  );

  console.log(response.data);
}

async function run() {

  try {

    console.log(
      chalk.cyan("\n[1] Requesting premium content...\n")
    );

    await axios.get(
      `${process.env.PUBLISHER_URL}/premium/ai-future`,
      {
        headers: {
          "User-Agent": "GPTBot/1.0",
        },
      }
    );

  } catch (err) {

    if (err.response?.status === 402) {

      console.log(
        chalk.yellow("[2] 402 Payment Required detected\n")
      );

      const paymentInfo = err.response.data;

      console.log(paymentInfo);

      const signature = await payRecipient(
        paymentInfo.recipient
      );

      console.log(
  chalk.cyan("\nWaiting for blockchain confirmation...\n")
);

await new Promise((resolve) =>
  setTimeout(resolve, 12000)
);

await verifyPayment(signature);
console.log(
  chalk.cyan("\n[7] Retrying protected request...\n")
);

const unlocked = await axios.get(
  `${process.env.PUBLISHER_URL}/premium/ai-future`,
  {
    headers: {
      "User-Agent": "GPTBot/1.0",
      "x-botwall-payment": signature,
    },
  }
);

console.log(
  chalk.green("[8] Premium content unlocked!\n")
);

console.log(unlocked.data);

      return;
    }

    console.error(
  err.response?.data || err.message
);
  }
}

run();