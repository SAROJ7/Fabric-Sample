
'use strict';

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..' , '..' , 'first-network', 'connection-org1.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf-8');
const ccp = JSON.parse(ccpJSON);

async function main(){
    try {

        //Creating a new CA client to interact with the CA
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url,{ trustedRoots: caTLSCACerts, verify: false }, caInfo.caName)

        // Creating a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);      
        console.log(`Wallet Path: ${walletPath}`);

        //Checking whether the admin user is already enrolled or not
        const adminExists = await wallet.exists('admin');
        if (adminExists){
            console.log('A identity for the admin user "admin" already exists');
            return;
        }

        // Enrolling the admin user, and importing the new identity into the wallet.
        const enrollment = await ca.enroll({enrollmentID: 'admin',enrollmentSecret: 'adminpw'});
        const identity = X509WalletMixin.createIdentity('Org1MSP',enrollment.certificate, enrollment.key.toBytes());
        await wallet.import('admin', identity)
        console.log('Successfully  enrolled admin user "admin" and imported it to the wallet');

    } catch (error) {
        console.error(`Failed to enroll admin user "admin" : ${error}`);
        process.exit(1);
    }

}

main();