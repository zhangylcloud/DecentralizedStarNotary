const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => { 
    let user0 = accounts[0]
    let user1 = accounts[1]
    let user2 = accounts[2]

    let name = "AStar"
    let story = "This is a star"
    let ra = "1"
    let dec = "1"
    let mag = "1"
    let starId = 1



    beforeEach(async function() { 
        this.contract = await StarNotary.new({from: user0})
    })
    
    describe('can create a star', () => { 
        it('can create a star and get its name', async function () { 
            await this.contract.createStar(name, ra, dec, mag, story, starId, {from: user0})
            let star = await this.contract.tokenIdToStarInfo(starId);
            assert.equal(star[0].toString(), name)
            assert.equal(star[1].toString(), ra)
            assert.equal(star[2].toString(), dec)
            assert.equal(star[3].toString(), mag)
            assert.equal(star[4].toString(), story)
        })
    })

    describe('buying and selling stars', () => { 
        let starPrice = web3.toWei(.01, "ether")

        beforeEach(async function () { 
            await this.contract.createStar(name, ra, dec, mag, story, starId, {from: user1})    
        })

        it('user1 can put up their star for sale', async function () { 
            assert.equal(await this.contract.ownerOf(starId), user1)
            await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            
            assert.equal(await this.contract.starsForSale(starId), starPrice)
        })

        describe('user2 can buy a star that was put up for sale', () => { 
            beforeEach(async function () { 
                await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            })

            it('user2 is the owner of the star after they buy it', async function() { 
                await this.contract.buyStar(starId, {from: user2, value: starPrice, gasPrice: 0})
                assert.equal(await this.contract.ownerOf(starId), user2)
            })

            it('user2 ether balance changed correctly', async function () { 
                let overpaidAmount = web3.toWei(.05, 'ether')
                const balanceBeforeTransaction = web3.eth.getBalance(user2)
                await this.contract.buyStar(starId, {from: user2, value: overpaidAmount, gasPrice: 0})
                const balanceAfterTransaction = web3.eth.getBalance(user2)

                assert.equal(balanceBeforeTransaction.sub(balanceAfterTransaction), starPrice)
            })
        })
    })

    describe('test related ERC721 functions', () => { 
        it('test checkIfStarExist', async function () { 
            await this.contract.createStar(name, ra, dec, mag, story, starId, {from: user0})
            let isExist = await this.contract.checkIfStarExist(ra, dec, mag);
            assert.equal(isExist, true);
        })
        it('test mint', async function () { 
            await this.contract.mint(user1, starId);
            let owner = await this.contract.ownerOf(starId);
            assert.equal(owner, user1);
        })
        it('test approve and getApproved', async function () { 
            await this.contract.createStar(name, ra, dec, mag, story, starId, {from: user1})
            await this.contract.approve(user2, starId, {from: user1});
            let approvedUser = await this.contract.getApproved(starId, {from: user1});
            assert.equal(approvedUser, user2);
        })
        it('test safeTransferFrom', async function () { 
            await this.contract.createStar(name, ra, dec, mag, story, starId, {from: user1})
            await this.contract.safeTransferFrom(user1, user2, starId, {from: user1});
            let newOwner = await this.contract.ownerOf(starId, {from: user1});
            assert.equal(newOwner, user2);
        })
        it('test SetApprovalForAll and isApprovedForAll', async function () { 
            await this.contract.createStar(name, ra, dec, mag, story, starId, {from: user1})
            await this.contract.setApprovalForAll(user2, true, {from: user1});
            let isValidOperator = await this.contract.isApprovedForAll(user1, user2, {from: user1});
            assert.equal(isValidOperator, true);
        })
        it('test ownerOf', async function () { 
            await this.contract.createStar(name, ra, dec, mag, story, starId, {from: user1})
            let originOwner = await this.contract.ownerOf(starId, {from: user2});
            assert.equal(originOwner, user1);
            await this.contract.safeTransferFrom(user1, user2, starId, {from: user1});
            let newOwner = await this.contract.ownerOf(starId, {from: user1});
            assert.equal(newOwner, user2);
        })
 

    })
    
})