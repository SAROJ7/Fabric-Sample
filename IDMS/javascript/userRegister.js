
'use strict';


const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'first-network','connection-org1.json');


async function main(){
    try{
        // Creating a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        //Checking whether the  newUser user is already enrolled or not
        const userExists = await wallet.exists("newUser");
        if (userExists) {
            console.log('An identity for the user "newUser" already exists in the wallet.');
            return;
        }

        //Checking whether the admin user is already enrolled or not
        const adminExists = await wallet.exists("admin");
        if (!adminExists) {
            console.log('No admin user');
            console.log('Run adminEnroll.js before Retrying');
        }

        // Creating a new gateway for connecting to peer node
        const gateway = new Gateway();
        await gateway.connect(ccpPath,{wallet, identity: 'admin',discovery: {enabled: true, asLocalhost: true}});

        // Getting the CA client object from the gateway for interacting with the CA
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        // Registering the user, enrolling the user, and importing the new identity into the wallet.
        const secret = await ca.register({affiliation: 'org1.department1', enrollmentID: 'newUser', role: 'client'}, adminIdentity);
        const enrollment = await ca.enroll({enrollmentID:'newUser',enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity('Org1MSP',enrollment.certificate,enrollment.key.toBytes());
        await wallet.import('newUser',userIdentity);
        console.log('Successfully registered and enrolled admin user "user1" and imported it into the wallet');

    } catch(error) {
        console.error(`Failed to register user "user1": ${error}`);
        process.exit(1);
    }
}


main();