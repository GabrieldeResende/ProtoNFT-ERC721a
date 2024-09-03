import { ethers } from "hardhat"

async function main() {
    const ProtoNFT = await ethers.getContractFactory("ProtoNFT")
    const contract = await ProtoNFT.deploy()

    await contract.waitForDeployment()
    const address = await contract.getAddress()

    console.log(`Contract was deployed at ${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1
})