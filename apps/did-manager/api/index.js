'use strict';

const express = require('express');
const router = express.Router();

const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const businessNetworkConnection = new BusinessNetworkConnection();

const namespace = 'org.example.commercialpaper';
const participantType = 'Company'

router.get('/', (req, res) => {
    res.send('api working');
});

router.post('/did', (req, res) => {
    // CREATE A DID AND SEND IT BACK
    res.send({did: 'DID:SOV:' + makeid()});
});

router.get('/did/all', (req, res) => {
    // GET ALL DIDs FROM SERVER
    res.setHeader('content-type', 'application/json');
    res.send([
        'DID:SOV:QRSTUVWXYZABCDEF',
        'DID:SOV:ABCDEFGHIJKLMNOP',
        'DID:SOV:GHIJKLMNOPQRSTUV'
    ]);
});

router.get('/participants', async (req, res) => {
    const businessNetworkDefinition = await businessNetworkConnection.connect('admin@local');
    const participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace+'.'+participantType);
    const serializer = businessNetworkDefinition.getSerializer();
    let returnObj = [];

    let participants = await participantRegistry.getAll();

    for (let j = 0; j < participants.length; j++) {
        let participant = serializer.toJSON(participants[j]);
        let obj = {
            participant: namespace + '.' + participantType + '#' + participant.symbol,
        };

        if (participant.hasOwnProperty('publicdid')) {
            obj.did = participant.publicdid.scheme+':'+participant.publicdid.method+':'+participant.publicdid.identifier;
        }

        returnObj.push(obj);
    }

    await businessNetworkConnection.disconnect();

    res.setHeader('content-type', 'application/json');
    res.send(returnObj);
});

router.post('/participant', async (req, res) => {
    let didSplit = req.body.did.split(':');

    const businessNetworkDefinition = await businessNetworkConnection.connect('admin@local');
    let factory = businessNetworkDefinition.getFactory();
    let assignTx = factory.newTransaction(namespace,'AssignDid');
    assignTx.targetCompany = factory.newRelationship(namespace, participantType, req.body.participant.split('#')[1]);
    assignTx.publicdid = factory.newConcept(namespace, 'DID');
    assignTx.publicdid.scheme = didSplit[0];
    assignTx.publicdid.method = didSplit[1];
    assignTx.publicdid.identifier = didSplit[2];

    await businessNetworkConnection.submitTransaction(assignTx);
    await businessNetworkConnection.disconnect();

    res.send({message: 'Successfully bound participant to DID'});
});

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  
    for (var i = 0; i < 16; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }
  

module.exports = router;