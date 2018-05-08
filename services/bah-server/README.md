# Commercial Paper Demo

## Composer Back-End

This demo application contains the back-end for the Hyperledger Composer commercial paper demo. It provides a sample Fabric network and the Composer definitions necessary to deploy the Composer project to the network. It also provides instructions for starting the Composer REST server and setting up the network participants for use with the Composer UI located at [insert repo URL here].

### Prerequisites

* At minimum you'll need to follow the Composer developer tools setup guide located here: https://hyperledger.github.io/composer/installing/development-tools.html
* It's recommended that you also follow the Composer developer guide in order to get a handle on how Composer networks are created and managed before setting off to build out this custom network: https://hyperledger.github.io/composer/tutorials/developer-guide.html
* A MongoDB database, or any sort of database that can easily be interfaced with NodeJS. The easiest solution (and the one which is assumed) is to simply grab a free cloud-hosted database over at https://mlab.com/. No setup, no hassle, easy-to-plug-in URL.
* A GitHub account with an OAuth app. Once you're logged in to your account, go to Settings by clicking on your profile icon, select Developer Settings > OAuth Apps and click New OAuth App. Use the following settings:

	* Name: hlf-cp
	* Homepage URL: http://localhost:3000/
	* Application description is optional
	* Authorization callback URL: http://localhost:3000/auth/github/callback

	Click 'Register application' to finish setup

* Additionally, you'll need three total GitHub accounts in order to simulate the three different organizations which are used to run this demo commercial paper network. One of these accounts can be the same as the one used to setup the OAuth app.

### Setup Composer Network

1. Clone this repository to your favorite directory
2. Run `npm install` inside the cloned repository to generate the Composer BNA file. Double-check that it was successfully created by looking inside the `dist` folder for a file called `commercial-paper.bna`
3. Now we need to make our Fabric network. Go to the directory in which the `startFabric.sh`, `stopFabric.sh`, `teardownFabric.sh`, and `createComposerProfile.sh` scripts are located, downloaded during installation of the Composer developer tools
	1. If you already have a Fabric network running, run `./stopFabric.sh` and then run `./teardownFabric.sh`
	2. Then run `./startFabric.sh` to bring up the hlfv1 network
	3. Once the network has been started, run `./createComposerProfile.sh` to complete the Fabric network setup
4. Return to the commercial paper repository directory and go into the `dist` folder
5. Run the following command: `composer network deploy -a commercial-paper.bna -p hlfv1 -i PeerAdmin -s randomString -A admin -S`
6. If this command succeeds, you should have a basic Fabric network running named hlfv1 and have deployed the Composer definitions for commercial paper to the network. Confirm this is the case by running `docker ps`, you should see five containers:
	* `dev-peer0.org1.example.com-commercial-paper-0.14.0` (chaincode container, the version number will differ based on your installed Composer version)
	* `peer0.org1.example.com` (peer on the network)
	* `ca.org1.example.com` (Fabric CA)
	* `order.example.com` (Fabric orderer)
	* `couchdb` (Fabric CouchDB)

### Setup Composer REST Server

1. Go to the cloned commercial paper repository and open the `rest-env` file in your favorite text editor
2. Under `github` in `COMPOSER_PROVIDERS`, replace the `clientID` and `clientSecret` fields with the values given to you by GitHub when you set-up an OAuth app
3. Under `db` in `COMPOSER_DATASOURCES`, replace the `url` field to point to the MongoDB instance you provisioned using mLab

	* If you choose to use a different datastore, you'll need to use the appropriate values for `connector` and `url`, use the Composer docs for reference: https://hyperledger.github.io/composer/integrating/deploying-the-rest-server.html

5. Now save and exit the file and run `source rest-env` from within the same directory to set these environment variables
6. We're now ready to start the REST server, run `composer-rest-server -p hlfv1 -n commercial-paper -i admin -s adminpw -N never -w true -a false` to start the REST server with authentication and multi-user mode disabled, which will be necessary for now
7. Open up `http://localhost:3000/` in your browser to access the REST server's Swagger UI
8. We'll now need to create the three organizations that participate in this network

	1. Expand the Company tab and click on the POST request
	2. Under the Data Type header, make sure Example Value is selected and click on the yellow box to auto-fill the request value box
	3. Replace the `name` field to contain `IBM` or whichever company name you'd prefer
	4. Enter a 6-character CUSIP identifier in the `identifier` field, it can be any combination of letters and numbers, we'll just choose `000001` as an example
	5. Enter `1000000` in the balance field, this is the amount of money the company has to perform trades on the network
	6. Repeat these steps two more times to create two other participants, using whichever name, identifier, and balance you want. Throughout the rest of this tutorial, it's assumed the other participants are RedHat and Google, with CUSIPs 000002 and 000003, respectively, and all balances start at $1,000,000.
	
9. Now we'll create the identities which are essentially a public/private key-pair and are bound to particular companies (participants) on the network

	1. Open the System endpoint
	2. Select `POST /system/identities/issue`
	3. Click the same yellow box as before to auto-fill the value box
	4. Replace the value for `participant` with a link to the participant (i.e. Company) this identity will be bound to. For example, to indicate this is an IBM identity, type in: `resource:fabric.hyperledger.cp.Company#IBM`
	
		* The `resource:` component indicates this a relationship to another resource in the Composer network, then `fabric.hyperledger.cp` indicates the namespace, `Company` is the type of resource we're pointing, and `#IBM` indicates the specific ID of the Company resource we are binding this identity to
	5. Replace the value for `userID` to whatever you'd like the ID of your participant to be. For simplicity, we'll simply call ours after the participant's name, e.g. IBM.
	6. You can keep the `options` field as an empty object
	7. Submit the transaction and wait for the identity to be created. Once the identity has been created, make sure to write down the `userSecret` which is returned in a safe place, it will be used when binding the identity to a user's wallet. There is a file, `user-secrets`, in the commercial paper repository used to note these down temporarily.
	8. Repeat these instructions to issue identities for each participant you created
	
10. Now we'll bind the previously created identities to users/wallets with authentication and multi-user mode enabled

	1. Shut-down the Composer REST server by hitting Ctrl-C in the terminal window where you started it
	2. Copy the following command in: `composer-rest-server -p hlfv1 -n commercial-paper -i admin -s adminpw -N never -w true -a true -m true`
	
		* This starts the REST server with authentication and multi-user mode enabled
	3. Refresh `http://localhost:3000/` and check that a new endpoint, Wallet, has been added at the bottom of the list
	4. First you'll need to authenticate yourself to the REST server, so navigate over to `http://localhost:3000/auth/github` to login using the GitHub OAuth service
	
		* You'll do this for each participant independently, which is why you need three separate GitHub accounts. Make sure you're logged out of any GitHub account before you visit this endpoint or you'll automatically be logged in using that account.
	5. Once you've logged in, you'll be redirected to the Composer REST interface and should see an access token at the top of the page. COPY THIS ACCESS TOKEN AND MARK DOWN WHICH ORGANIZATION IT'S FOR! You'll need to give it to the UI later in order for it authenticate requests as that organization.
	6. Expand the Wallet endpoint
	7. Click the `GET /wallets` request and send it without putting anything in the value field
	8. The response will have an `id` field, mark this down as you'll need it to make transactions on the wallet
	9. Click the `POST /wallets/{id}/identities` request and click the yellow box to auto-fill the value field
	10. Enter the wallet ID retrieved earlier in the `id` field
	11.  Replace the `enrollmentID` field with the value you entered for `userID` when initially enrolling the user
	
	* For example, if I logged using the GitHub account which I've decided will be IBM's, and now want to bind the identity with a `userID` of IBM to this wallet, I would enter `IBM`
	12. Replace the `enrollmentSecret` field with the secret given to you when you initially issued the identity
	13. By sending the request, the REST server will exchange the `enrollmentID` and `enrollmentSecret` for a certificate pair and store it in its database, associated with the current wallet. Make sure to copy down the `id` returned as a response to the request, you'll need it in the next step.
	14. Finally, to complete binding of the identity to the wallet, click on the `POST /wallet/{id}/identities/{fk}` request
	15. In the `id` field enter the wallet ID
	16. In the `fk` field enter the identity ID as it was returned to you in step 13.
	17. Success! You should have successfully logged in with a GitHub account, bound an identity to the user's wallet, and then set that identity as the default.
	18. Now, logout of your GitHub account and start over at step 4 in order to create the three users and three wallets, one for each participant in the network


### Tips, Tricks, and Warnings

* Careful, the `admin` identity used to start the Composer REST server can only be registered with the CA once! ONLY use this identity when starting the Composer REST server, if it is used with any of the other Composer CLI commands, the CLI command will exchange the `adminpw` secret for a certificate and the REST server will be unable to use it. You'll have to teardown Fabric and start all over.
* If you decide you want to teardown the Fabric network and start over, make sure to completely wipe-out your MongoDB datastore first! Otherwise Composer REST server will attempt to use the certificates stored there even though they are no longer in the Fabric CA, causing authentication and registration errors.
* If you decide you want to wipe out the existing users, identities, and access tokens in the datastore, make sure to delete everything except the `admin` identity credentials. If the `admin` credentials are deleted, you will have lost the private key associated with it and the Composer REST server will no longer be able to authenticate with the Fabric network. You'll need to teardown Fabric and start over.