const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');

async function main() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('newUser');
        if (!userExists) {
            console.log('An identity for the user "newUser" does not exist in the wallet');
            console.log('Run the userRegister.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'newUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('idms');

        // Evaluate the specified transaction.
        // read_everything transaction - requires no argument, ex: ('read_everything')
        // read transaction - requires 1 arguments(Whether identity key or owner key ), ex: ('read','i1') /  ('read','o1')
        // read attribute by identity - requires 2 arguments (identityID and attribute ) , ex: ('read_attribute','i1','SLC')
        // read identity by owner id - requires 1 arguments ('read_identity_by_owner_id','o1')
        const result = await contract.evaluateTransaction('read_everything');
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

main();
