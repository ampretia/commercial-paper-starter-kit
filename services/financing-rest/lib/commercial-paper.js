/** Transaction logic **/

/**
 * Issues a new commercial paper
 *
 * @param {fabric.hyperledger.cp.IssuePaper} issueOrder Contains data to issue a commercial paper
 * @transaction
 */
function issuePaper(issueOrder) {
	var validationErrors = validateIssueOrder(issueOrder);
	if (validationErrors.length > 0) {
		throw new Error(validationErrors.toString());
	}
  
	// Build the asset and add it to the ledger
	return getAssetRegistry('fabric.hyperledger.cp.CommercialPaper')
		.then(function(assRegistry) {
			var assFactory = getFactory();
			var maturityDate = new Date();
			maturityDate.setDate(issueOrder.issuedTimestamp.getDate() + issueOrder.maturity);
			var newPaper = assFactory.newResource('fabric.hyperledger.cp', 'CommercialPaper', generateCUSIP(issueOrder.issuer, maturityDate));
			newPaper.par = issueOrder.par;
			newPaper.quantityIssued = issueOrder.quantityIssued;
			newPaper.discount = issueOrder.discount;
			newPaper.maturity = issueOrder.maturity;
			newPaper.issuer = issueOrder.issuer;
			newPaper.issuedTimestamp = issueOrder.issuedTimestamp;
	  
			return assRegistry.add(newPaper);
		})
		.catch(function(error) {
			throw new Error(error);
		});
}

/**
 * Updates a paper ownership with a new value for the amount of paper
 * which is up for purchase
 *
 * @param {fabric.hyperledger.cp.SellPaper} sellOrder Contains info for selling commercial paper
 * @transaction
 */
function sellPaper(sellOrder) {
  	var validationErrors = validateSellOrder(sellOrder);
  	if (validationErrors.length > 0) {
      	throw new Error(validationErrors.toString());
    }
  
  	return getAssetRegistry('fabric.hyperledger.cp.PaperOwnership')
  		.then(function(assRegistry) {	
      		var ownership = sellOrder.ownership;
      		ownership.quantityForSale = sellOrder.quantityToSell;
      
      		return assRegistry.update(ownership);
    	})
  		.catch(function(error) {
      		throw new Error(error);
    	});
}

/**
 * Purchases commercial paper and assigns it to the requested issuer
 *
 * @param {fabric.hyperledger.cp.PurchasePaper} purchaseOrder Contains info to purchase commercial paper
 * @transaction
 */
function purchasePaper(purchaseOrder) {
	// Validate the purchase order
	var validationErrors = validatePurchaseOrder(purchaseOrder);
	if (validationErrors.length > 0) {
		throw new Error(validationErrors.toString());
	}
  
	var totalPapersIssued = purchaseOrder.paper.quantityIssued; // Total number of papers issued
	var totalOwned = 0;                                         // Total number of issued papers owned by participants
	var totalForSale = 0;                                       // Total number of issued papers that are for sale
	var totalNeeded = purchaseOrder.quantity;                   // Running total of number of papers still needed - updated during purchase process
	var unpurchasedPapers = 0;                                  // Total number of issued papers that have not yet been purchased from the issuer
	var ownedByCurrentParticipant = null;                       // Ownership object if the current participant already owns some of this paper
	var potentialPurchaseFrom = [];                             // Array of ownerships willing to sell some or all their papers
	var actualPurchaseFrom = [];                                // Array of ownerships which have been selected to purchase from

	// Retrieve all ownerships of this paper
	var ownershipsQuery = buildQuery('SELECT fabric.hyperledger.cp.PaperOwnership WHERE (paper == _$paper)');

	return query(ownershipsQuery, { paper: 'resource:' + purchaseOrder.paper.getFullyQualifiedIdentifier() })
			.then(function(ownerships) {
				// Process each ownership to find available papers and to retrieve paper already owned by this company
				ownerships.forEach(function(ownership) {
					if (ownership.owner.getFullyQualifiedIdentifier() === getCurrentParticipant().getFullyQualifiedIdentifier()) {
						ownedByCurrentParticipant = ownership;
					} else {
						totalForSale += ownership.quantityForSale;

						if (ownership.quantityForSale > 0) {
							potentialPurchaseFrom.push(ownership);
						}
					}

					totalOwned += ownership.quantity;
				});
	  
				// Add as available for purchase those papers which have been issued but have not been purchased by anyone yet
				unpurchasedPapers = totalPapersIssued - totalOwned;
				totalForSale += unpurchasedPapers;

				// Ensure there are enough papers available for sale
				if (purchaseOrder.quantity > totalForSale) {
					throw new Error("Attempting to purchase " + purchaseOrder.quantity + " papers but only " + totalForSale + " are available for purchase");
				}
	  
				// Get the asset registry to begin executing the purchases
				return getAssetRegistry('fabric.hyperledger.cp.PaperOwnership');
			})
			.then(function(assRegistry) {
				var promises = [];   // Array of promises that contain all PaperOwnership updates and are resolved at the end
	  
				// First purchase issued but unowned papers
				if (unpurchasedPapers >= totalNeeded) {
					unpurchasedPapers -= totalNeeded;
					actualPurchaseFrom.push({ "company": purchaseOrder.paper.issuer.name, "amount": totalNeeded });
					totalNeeded = 0;
				} else {
					totalNeeded -= unpurchasedPapers;
					actualPurchaseFrom.push({ "company": purchaseOrder.paper.issuer.name, "amount": unpurchasedPapers });
					unpurchasedPapers = 0;
				}
	  
				// Purchase any remaining needed paper from other sellers
				while (totalNeeded > 0) {
					var seller = potentialPurchaseFrom.shift();

					if (totalNeeded <= seller.quantityForSale) {
						seller.quantity -= totalNeeded;
						seller.quantityForSale -= totalNeeded;
					  
						actualPurchaseFrom.push({ "company": seller.owner.getIdentifier(), "amount": totalNeeded });
						totalNeeded = 0;

						if (seller.quantity > 0) {
							promises.push(assRegistry.update(seller));
						} else {
							promises.push(assRegistry.remove(seller));
						}
					} else {
						totalNeeded -= seller.quantityForSale;
						seller.quantity -= seller.quantityForSale;
					  
						actualPurchaseFrom.push({ "company": seller.owner.getIdentifier(), "amount": seller.quantityForSale });
						seller.quantityForSale = 0;
					  
						if (seller.quantity > 0) {
							promises.push(assRegistry.update(seller));
						} else {
							promises.push(assRegistry.remove(seller));
						}
					}
				}

				// Update the balance of each participant	  
				promises.push(getParticipantRegistry('fabric.hyperledger.cp.Company')
								.then(function(partRegistry) {
									var participantPromises = [];
				  
									// Adds the amount for the purchase to every seller's balance
									actualPurchaseFrom.forEach(function(seller) {
										participantPromises.push(partRegistry.get(seller.company)
																.then(function(participant) {
																	var cost = costOfPurchase(seller.amount, purchaseOrder.paper.par, purchaseOrder.paper.discount);
																	participant.balance += cost;
																	return partRegistry.update(participant);
																}));
									});
									
									// Subtracts the total cost of the purchase from the buyer's balance
									purchaseOrder.buyer.balance -= costOfPurchase(purchaseOrder.quantity, purchaseOrder.paper.par, purchaseOrder.paper.discount);;
									participantPromises.push(partRegistry.update(purchaseOrder.buyer));
									return Promise.all(participantPromises);
								}));

				// Update or create the ownership for this paper for the buyer
				if (totalNeeded <= 0) {
					// If the buyer already owns some of this paper, simply update the existing ownerships
					if (ownedByCurrentParticipant != null) {
						ownedByCurrentParticipant.quantity += purchaseOrder.quantity;
						ownedByCurrentParticipant.quantityForSale += purchaseOrder.quantityForSale;

						promises.push(assRegistry.update(ownedByCurrentParticipant));
					} else {
						// If the buyer doesn't own any of this paper, create a new ownership and add it to the ledger
						var factory = getFactory();
						var newOwnershipID = purchaseOrder.buyer.getIdentifier() + ',' + purchaseOrder.paper.CUSIP;
						var newOwnership = factory.newResource('fabric.hyperledger.cp', 'PaperOwnership', newOwnershipID);
						newOwnership.paper = purchaseOrder.paper;
						newOwnership.owner = purchaseOrder.buyer;
						newOwnership.quantity = purchaseOrder.quantity;
						newOwnership.quantityForSale = purchaseOrder.quantityForSale;

						promises.push(assRegistry.add(newOwnership));
					}
				} else {
					throw new Error("Could not find enough papers to purchase, cancelling transaction");
				}
	  
				return Promise.all(promises);
			})
			.catch(function(error) {
				throw new Error(error);
			});
}

/** Helper functions **/

function validateSellOrder(sellOrder) {
	var errors = [];
  
  	var sellerErr = validateParticipantIsCurrentParticipant(sellOrder.ownership.owner);
  	if (sellerErr.error) {
      	errors.push(sellerErr.msg);
    }
  
  	var quantErr = validateSellQuantityIsLessThanOwnedQuantity(sellOrder.ownership, sellOrder.quantityToSell);
  	if (quantErr.error) {
      	errors.push(quantErr.msg);
    }
  
  	return errors;
}

/**
 * Checks the contents of the request when a participant attempts
 * to purchase commercial paper and verifies that the contents pass
 * sanity checks
 *
 * @param {fabric.hyperledger.cp.PurchasePaper} purchaseOrder The object containing the purchase details
 * @return {array} An array of error messages, empty if there are none
 */
function validatePurchaseOrder(purchaseOrder) {
	var errors = [];
  
	var ownerErr = validateParticipantIsCurrentParticipant(purchaseOrder.buyer);
	if (ownerErr.error) {
		errors.push(ownerErr.msg);
	}
  
	var quantErr = validateQuantityPurchased(purchaseOrder.quantity);
	if (quantErr.error) {
		errors.push(quantErr.msg);
	}
  
	var quantForSaleErr = validateQuantityForSale(purchaseOrder.quantity, purchaseOrder.quantityForSale);
	if (quantForSaleErr.error) {
		errors.push(quantForSaleErr.msg);
	}
  
	var balanceErr = validateBalance(purchaseOrder.buyer, purchaseOrder.quantity, purchaseOrder.paper);
	if (balanceErr.error) {
		errors.push(balanceErr.msg);
	}
  
	return errors;
}

/**
 * Checks the contents of the request when a participant attempts
 * to issue commercial paper and verifies that the contents pass
 * sanity checks
 *
 * @param {fabric.hyperledger.cp.IssuePaper} issueOrder The object containing the paper issue details
 * @return {array} An array of error messages, empty if there are none
 */
function validateIssueOrder(issueOrder) {
	var errors = [];

	var parErr = validatePar(issueOrder.par);
	if (parErr.error) {
		errors.push(parErr.msg);
	}
  
	var quantErr = validateQuantityIssued(issueOrder.quantityIssued);
	if (quantErr.error) {
		errors.push(quantErr.msg);
	}
  
	var discountErr = validateDiscount(issueOrder.discount);
	if (discountErr.error) {
		errors.push(discountErr.msg);
	}
  
	var maturityErr = validateMaturity(issueOrder.maturity);
	if (maturityErr.error) {
		errors.push(maturityErr.msg);
	}
  
	var issuerErr = validateParticipantIsCurrentParticipant(issueOrder.issuer);
	if (issuerErr.error) {
		errors.push(issuerErr.msg);
	}
	
	return errors;
}

function validateSellQuantityIsLessThanOwnedQuantity(ownership, sellQuantity) {
  	if (sellQuantity < 0) {
    	return { "error": true, "msg": "Sell quantity must be greater than 0" };
    }
  
  	if (sellQuantity > ownership.quantity) {
      	return { "error": true, "msg": "Sell quantity must be less than the number of papers owned" };
    }
  
  	return { "error": false };
}

function validateCUSIP(cusip) {
	if (cusip.length != 9) {
		return { "error": true, "msg": "CUSIP must be 9 characters long" };
	}

	return { "error": false };
}

function validatePar(par) {
	if (par <= 0) {
		return { "error": true, "msg": "Par value must be greater than 0" };
	}
  
	return { "error": false };
}

function validateQuantityIssued(quantIssued) {
	if (quantIssued <= 0) {
		return { "error": true, "msg": "Quantity issued must be greater than 0" };
	}
  
	return { "error": false };
}

function validateDiscount(discount) {
	if (!(discount > 0 && discount < 1)) {
		return { "error": true, "msg": "Discount must be greater than 0% and less than 100%" };
	}
  
	return { "error": false };
}

function validateMaturity(maturity) {
	if (!(maturity > 0 && maturity <= 270)) {
		return { "error": true, "msg": "Maturity must be at least 1 day and less than 270 days" };
	}
  
	return { "error": false };
}

function validateParticipantIsCurrentParticipant(participant) {
	if (getCurrentParticipant() == null) {
		return { "error": true, "msg": "Identity is not associated with any participant, cannot issue commercial paper" };
	}
  
	if (!(participant.getFullyQualifiedIdentifier() === getCurrentParticipant().getFullyQualifiedIdentifier())) {
		return { "error": true, "msg": "A participant can only issue or purchase commercial paper for itself" };
	}
  
	return { "error": false };
}

function validateQuantityPurchased(quantPurchased) {
	return { "error": false };
}

function validateQuantityForSale(quantPurchased, quantForSale) {
	if (quantForSale > quantPurchased) {
		return { "error": true, "msg": "Quantity for sale must be less than or equal to the quantity purchased" };
	}
  
	return { "error": false };
}

function validateBalance(buyer, amount, paper) {
	var cost = costOfPurchase(amount, paper.par, paper.discount);
	if (cost > buyer.balance) {
		return { "error": true, "msg": "Buyer does not have sufficient funds to purchase paper, balance = $" + buyer.balance + ", cost = $" + cost };
	}
  
	return { "error": false };
}

function costOfPurchase(amount, par, discount) {
	return amount * (par * (1 - discount));
}

function generateCUSIP(participant, ts) {
	var alphabet = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ];
  
	var prefix = participant.identifier;
	var monthNum = ts.getMonth();
	var dayNum = ts.getDate();
	var suffix = alphabet[monthNum] + (dayNum < 10 ? dayNum : alphabet[dayNum - 10]);
	var checkDig = computeCUSIPCheckDigit(prefix + suffix);
  
	return (prefix + suffix + checkDig);
}

function computeCUSIPCheckDigit(cusip) {
	var lookup = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'J': 10, 'K': 11, 'L': 12, 'M': 13, 'N': 14, 'P': 16, 'Q': 17, 'R': 18, 'S': 19,
				   'T': 20, 'U': 21, 'V': 22, 'W': 23, 'X': 24, 'Y': 25, 'Z': 26, '*': 27, '@': 28, '#': 29 };
	var sum = 0;
  
	for (var i = 0; i < 8; i++) {
		var char = cusip[i];
		var parsedChar = parseInt(char);
		var value = 0;
	  
		if (isNaN(parsedChar)) {
			value = lookup[char] + 9;
		} else {
			value = parsedChar;
		}
	  
		if ((i + 1) % 2 == 0) {
			value *= 2;
		}
	  
		sum += Math.floor(value / 10) + value % 10;
	}
  	
	return (10 - (sum % 10)) % 10;
}
