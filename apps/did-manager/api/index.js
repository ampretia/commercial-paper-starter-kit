'use strict';

const express = require('express');
const router = express.Router();
const request = require('request');

const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const businessNetworkConnection = new BusinessNetworkConnection();

const namespace = 'org.example.commercialpaper';
const participantType = 'Company';
const cardName = 'admin@local';
const didServer = 'http://localhost:8888/dids';

router.get('/', (req, res) => {
    res.send('api working');
});

router.post('/did', (req, res) => {
    request.post(didServer, {}, (err, resp, body) => {
        if (err) {
            res.status(500).send({message: 'Error creating DID'});
        }
        res.send({did: body});
    });
});

router.get('/did/all', (req, res) => {
    // GET ALL DIDs FROM SERVER
    request.post(didServer, {}, (err, resp, body) => {
        if (err) {
            res.status(500).send({message: 'Error getting DIDs'});
        }
        res.setHeader('content-type', 'application/json');
        res.send(body);
    });
});

router.get('/participants', async (req, res) => {
    // GET ALL PARTICIPANTS
    const businessNetworkDefinition = await businessNetworkConnection.connect(cardName);
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

router.put('/participant', async (req, res) => {
    // UPDATE PARTICIPANT TO HAVE A DID FIELD
    let didSplit = req.body.did.split(':');

    const businessNetworkDefinition = await businessNetworkConnection.connect(cardName);
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

module.exports = router;