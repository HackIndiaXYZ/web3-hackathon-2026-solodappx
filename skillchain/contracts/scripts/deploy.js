const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("╔════════════════════════════════════════╗");
  console.log("║     SkillChain Contract Deployment     ║");
  console.log("╚════════════════════════════════════════╝");
  console.log(`\n📡 Network: ${network.name} (chainId: ${network.chainId})`);
  console.log(`🔑 Deployer: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} MATIC\n`);

  if (balance === 0n) {
    console.error("❌ Deployer has no MATIC. Get test MATIC from https://faucet.polygon.technology/");
    process.exit(1);
  }

  console.log("⏳ Deploying SkillChain contract...");

  const SkillChain = await ethers.getContractFactory("SkillChain");
  const skillchain = await SkillChain.deploy();
  await skillchain.waitForDeployment();

  const address = await skillchain.getAddress();
  const deployTx = skillchain.deploymentTransaction();

  console.log("\n✅ SkillChain deployed successfully!");
  console.log(`📄 Contract Address: ${address}`);
  console.log(`🔗 Tx Hash: ${deployTx?.hash}`);

  if (network.chainId === 80002n) {
    console.log(`\n🔍 View on Polygonscan:`);
    console.log(`   https://amoy.polygonscan.com/address/${address}`);
  }

  console.log("\n📋 Add to your .env files:");
  console.log(`   VITE_CONTRACT_ADDRESS=${address}   (frontend/.env)`);
  console.log(`   CONTRACT_ADDRESS=${address}         (backend/.env)`);

  // Verify initial state
  const owner = await skillchain.owner();
  const total = await skillchain.totalCredentials();
  console.log(`\n📊 Initial state:`);
  console.log(`   Owner: ${owner}`);
  console.log(`   Total Credentials: ${total}`);

  return address;
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("❌ Deployment failed:", err);
    process.exit(1);
  });
