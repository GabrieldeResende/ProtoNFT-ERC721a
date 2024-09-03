import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("ProtoNFT", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {

    const [owner, otherAccount] = await hre.ethers.getSigners();

    const ProtoNFT = await hre.ethers.getContractFactory("ProtoNFT");
    const contract = await ProtoNFT.deploy();

    return { contract, owner, otherAccount };
  }

  it("Should has name", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    expect(await contract.name()).to.equal("ProtoNFT", "Can not get name");
  });

  it("Should has symbol", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    expect(await contract.symbol()).to.equal("PNFT", "Can not get symbol");
  });

  it("Should mint", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") })

    const balance = await contract.balanceOf(owner.address);
    const tokenId = 0
    const ownerOf = await contract.ownerOf(tokenId);
    const totalSupply = await contract.totalSupply()

    expect(balance).to.equal(1, "Can not mint");
    expect(ownerOf).to.equal(owner.address, "Can not mint");
    expect(totalSupply).to.equal(1, "Can not mint");
  });

  it("Should NOT mint(payment)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);
    await expect(contract.mint(1)).to.be.rejectedWith("Insufficient payment");
  });

  it("Should burn", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") })
    const tokenId = 0

    await contract.burn(tokenId)

    const balance = await contract.balanceOf(owner.address);
    const totalSupply = await contract.totalSupply()

    expect(balance).to.equal(0, "Can not burn");
    expect(totalSupply).to.equal(0, "Can not burn");
  });

  it("Should burn(approved)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") })
    const tokenId = 0

    await contract.approve(otherAccount.address, tokenId)
    const approved = await contract.getApproved(tokenId)

    const instance = contract.connect(otherAccount)
    await instance.burn(tokenId)

    const balance = await contract.balanceOf(owner.address);
    const totalSupply = await contract.totalSupply()

    expect(balance).to.equal(0, "Can not burn(approved)");
    expect(totalSupply).to.equal(0, "Can not burn(approved)");
    expect(approved).to.equal(otherAccount.address, "Can not burn(approved)");
  });

  it("Should burn(approved for all)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") })
    const tokenId = 0

    await contract.setApprovalForAll(otherAccount.address, true)

    const instance = contract.connect(otherAccount)
    await instance.burn(tokenId)

    const balance = await contract.balanceOf(owner.address);
    const totalSupply = await contract.totalSupply()

    expect(balance).to.equal(0, "Can not burn(approved for all)");
    expect(totalSupply).to.equal(0, "Can not burn(approved for all)");
  });

  it("Should NOT burn(not exists)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await expect(contract.burn(1)).to.be.revertedWithCustomError(contract, "OwnerQueryForNonexistentToken");
  });

  it("Should NOT burn(not permission)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") })
    const tokenId = 0

    const instance = contract.connect(otherAccount)
    await expect(instance.burn(tokenId)).to.be.revertedWithCustomError(contract, "TransferCallerNotOwnerNorApproved");
  });

  it("Should has URI metadata", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") })
    const tokenId = 0

    expect(await contract.tokenURI(tokenId)).to.equal("ipfs://Qmf3DE9pk71d543y23cnmttq8jvUn3TmxKSFmdMrfSwvJp/0.json", "Can not get Uri Metadata");
  });

  it("Should NOT has URI metadata", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await expect(contract.tokenURI(1)).to.be.revertedWithCustomError(contract, "URIQueryForNonexistentToken");
  });

  it("Should transfer", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") })
    const tokenId = 0

    await contract.transferFrom(owner.address, otherAccount.address, tokenId)

    const balanceFrom = await contract.balanceOf(owner.address);
    const balanceTo = await contract.balanceOf(otherAccount.address)
    const ownerOf = await contract.ownerOf(tokenId);

    expect(balanceFrom).to.equal(0, "Can not transfer");
    expect(balanceTo).to.equal(1, "Can not transfer");
    expect(ownerOf).to.equal(otherAccount.address, "Can not transfer");
  });

  it("Should emit transfer", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") })
    const tokenId = 0

    await expect(contract.transferFrom(owner.address, otherAccount.address, tokenId)).to.emit(contract, "Transfer").withArgs(owner.address, otherAccount.address, tokenId);
  });

  it("Should transfer", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") })
    const tokenId = 0

    await contract.approve(otherAccount.address, tokenId)
    const approved = await contract.getApproved(tokenId)

    const instance = contract.connect(otherAccount)
    await instance.transferFrom(owner.address, otherAccount.address, tokenId)

    const ownerOf = await contract.ownerOf(tokenId);

    expect(ownerOf).to.equal(otherAccount.address, "Can not transfer");
    expect(approved).to.equal(otherAccount.address, "Can not transfer");
  });

  it("Should emit approval", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") })
    const tokenId = 0

    await expect(contract.approve(otherAccount.address, tokenId)).to.emit(contract, "Approval").withArgs(owner.address, otherAccount.address, tokenId);
  });

  it("Should clear approvals", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") })
    const tokenId = 0

    await contract.approve(otherAccount.address, tokenId)

    await contract.transferFrom(owner.address, otherAccount.address, tokenId)

    const approved = await contract.getApproved(tokenId)

    expect(approved).to.equal("0x0000000000000000000000000000000000000000", "Can not clear approval");
  });

  it("Should transfer (approve for all)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") })
    const tokenId = 0

    await contract.setApprovalForAll(otherAccount.address, true)
    const approved = await contract.isApprovedForAll(owner.address, otherAccount.address)

    const instance = contract.connect(otherAccount)
    await instance.transferFrom(owner.address, otherAccount.address, tokenId)

    const ownerOf = await contract.ownerOf(tokenId);

    expect(ownerOf).to.equal(otherAccount.address, "Can not transfer");
    expect(approved).to.equal(true, "Can not transfer");
  });

  it("Should emit approval", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") })

    await expect(contract.setApprovalForAll(otherAccount.address, true)).to.emit(contract, "ApprovalForAll").withArgs(owner.address, otherAccount.address, true);
  });

  it("Should NOT transfer (permission)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") })
    const tokenId = 0

    const instance = contract.connect(otherAccount)

    await expect(instance.transferFrom(owner.address, otherAccount.address, tokenId)).to.be.revertedWithCustomError(contract, "OwnerQueryForNonexistentToken");
  });

  it("Should NOT transfer (exists)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    const tokenId = 1

    await expect(contract.transferFrom(owner.address, otherAccount.address, tokenId)).to.be.revertedWithCustomError(contract, "OwnerQueryForNonexistentToken")
  });

  it("Should supports interface", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    expect(await contract.supportsInterface("0x80ac58cd")).to.equal(true, "Can not suport interface");
  });

  it("Should withdraw", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    const ownerBalanceBefore = await ethers.provider.getBalance(owner.getAddress())

    const instance = contract.connect(otherAccount)
    await instance.mint(1, { value: ethers.parseEther("0.01") })

    await contract.withdraw()

    const contractBalance = await ethers.provider.getBalance(contract.getAddress())
    const ownerBalanceAfter = await ethers.provider.getBalance(owner.getAddress())

    expect(contractBalance).to.equal(0, "Can not mint");
    expect(ownerBalanceAfter).to.greaterThan(ownerBalanceBefore, "Can not mint");
  });

  it("Should NOT withdraw (permission)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    const instance = contract.connect(otherAccount)
    await expect(instance.withdraw()).to.be.rejectedWith("You do not have permission");
  });
});
