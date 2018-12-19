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
})