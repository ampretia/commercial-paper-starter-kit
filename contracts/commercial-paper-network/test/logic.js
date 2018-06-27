/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/**
 * Write the unit tests for your transction processor functions here
 */

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, CertificateUtil, IdCard } = require('composer-common');
const path = require('path');

const chai = require('chai');
chai.should();
chai.use(require('chai-as-promised'));

const namespace = 'org.example.commercialpaper';
const assetType = 'SampleAsset';
const assetNS = namespace + '.' + assetType;
const participantType = 'SampleParticipant';
const participantNS = namespace + '.' + participantType;

describe('#' + namespace, () => {
    // In-memory card store for testing so cards are not persisted to the file system
    const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore( { type: 'composer-wallet-inmemory' } );
    let adminConnection;
    const adminCardName = 'admin';
    let businessNetworkName;
    let businessNetworkConnection;
    let factory;

    before(async () => {
        // Embedded connection used for local testing
        const connectionProfile = {
            name: 'embedded',
            'x-type': 'embedded'
        };
        // Generate certificates for use with the embedded connection
        const credentials = CertificateUtil.generate({ commonName: 'admin' });

        // Identity used with the admin connection to deploy business networks
        const deployerMetadata = {
            version: 1,
            userName: 'PeerAdmin',
            roles: [ 'PeerAdmin', 'ChannelAdmin' ]
        };

        const deployerCard = new IdCard(deployerMetadata, connectionProfile);
        deployerCard.setCredentials(credentials);

        const deployerCardName = 'PeerAdmin';
        adminConnection = new AdminConnection({ cardStore: cardStore });

        await adminConnection.importCard(deployerCardName, deployerCard);
        await adminConnection.connect(deployerCardName);
    });

    // /**
    //  *
    //  * @param {String} cardName The card name to use for this identity
    //  * @param {Object} identity The identity details
    //  */
    // async function importCardForIdentity(cardName, identity) {
    //     const metadata = {
    //         userName: identity.userID,
    //         version: 1,
    //         enrollmentSecret: identity.userSecret,
    //         businessNetwork: businessNetworkName
    //     };
    //     const card = new IdCard(metadata, connectionProfile);
    //     await adminConnection.importCard(cardName, card);
    // }

    // This is called before each test is executed.
    beforeEach(async () => {
        businessNetworkConnection = new BusinessNetworkConnection({ cardStore: cardStore });

        const adminUserName = 'admin';
        let adminCardName;
        const businessNetworkDefinition = await BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'));

        // Install the Composer runtime for the new business network
        await adminConnection.install(businessNetworkDefinition);

        // Start the business network and configure a network admin identity
        const startOptions = {
            networkAdmins: [
                {
                    userName: adminUserName,
                    enrollmentSecret: 'adminpw'
                }
            ]
        };
        const adminCards = await adminConnection.start(businessNetworkDefinition.getName(), businessNetworkDefinition.getVersion(), startOptions);

        // Import the network admin identity for us to use
        adminCardName = `${adminUserName}@${businessNetworkDefinition.getName()}`;

        await adminConnection.importCard(adminCardName, adminCards.get(adminUserName));

        // Connect to the business network using the network admin identity
        await businessNetworkConnection.connect(adminCardName);

        factory = businessNetworkConnection.getBusinessNetwork().getFactory();

        // assetRegistry.addAll([asset1, asset2]);

        // Issue the identities.
        // let identity = await businessNetworkConnection.issueIdentity(participantNS + '#alice@email.com', 'alice1');
        // await importCardForIdentity(aliceCardName, identity);
        // identity = await businessNetworkConnection.issueIdentity(participantNS + '#bob@email.com', 'bob1');
        // await importCardForIdentity(bobCardName, identity);
    });

    // describe('CreatePaper', () => {
    //     it('should work', async () => {

    //     });
    // });

    // /**
    //  * Reconnect using a different identity.
    //  * @param {String} cardName The name of the card for the identity to use
    //  */
    // async function useIdentity(cardName) {
    //     await businessNetworkConnection.disconnect();
    //     businessNetworkConnection = new BusinessNetworkConnection({ cardStore: cardStore });
    //     events = [];
    //     businessNetworkConnection.on('event', (event) => {
    //         events.push(event);
    //     });
    //     await businessNetworkConnection.connect(cardName);
    //     factory = businessNetworkConnection.getBusinessNetwork().getFactory();
    // }

});
