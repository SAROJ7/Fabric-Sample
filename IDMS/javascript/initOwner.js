
'use strict';

const { FileSystemWallet, Gateway} = require('fabric-network');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..' ,'first-network','connection-org1.json');

async function main() {
    try {
        //Creating a new file system based wallet to manage identities
        const walletPath = path.join(process.cwd(),'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet Path: ${walletPath}`);

        //Checking to see if we have already enrolled the newUser
        const userExists = await wallet.exists('newUser');
        if (!userExists) {
            console.log('An identity for the user "newUser" does not exist in the wallet');
            console.log('Run the userRegister.js application before retrying');
            return;
        }

        //Creating a gateway for connecting to peer node
        const gateway = new Gateway();
        await gateway.connect(ccpPath, {wallet, identity: 'admin', discovery: {enabled: true, asLocalhost: true}});

        //Getting the channel our chaincode is deployed to.
        const network = await gateway.getNetwork('mychannel');

        //Getting the chaincode from the network.
        const contract = await network.getContract('idms');

        //submitting the transaction to initiate owner.
        await contract.submitTransaction('init_owner', 'o1','David','NEA');
        console.log('Transaction has been submitted');

        //Disconnecting from the gateway
        await gateway.disconnect();

    } catch(error) {
        console.error(`failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();