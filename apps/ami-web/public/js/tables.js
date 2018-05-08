/**
 * Created by davery on 3/29/2016.
 */
'use strict';
function createRow(data) {
    let tr = document.createElement('tr');

    for (let index in data) {
        let td = document.createElement('td');
        tr.appendChild(td);

        let text = document.createTextNode(data[index]);
        td.appendChild(text);
    }

    return tr;
}

/**
 * Generates a buy button cell that users can click to purchase commercial paper.
 * @param disabled True if the button should be disabled, false otherwise.
 * @param cusip The cusip for the paper that this button is assigned to.
 * @param issuer The issuer of the paper that this button is assigned to.
 * @returns {Element} A table cell with a configured buy button.
 */
function buyButton(disabled, cusip, issuer) {
    let button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('data_cusip', cusip);
    button.setAttribute('data_issuer', issuer);
    if(disabled) {button.disabled = true;}
    button.classList.add('buyPaper');
    button.classList.add('altButton');

    let span = document.createElement('span');
    span.classList.add('fa');
    span.classList.add('fa-exchange');
    span.innerHTML = ' &nbsp;&nbsp;BUY 1';
    button.appendChild(span);

    // Wrap the buy button in a td like the other items in the row.
    let td = document.createElement('td');
    td.appendChild(button);

    return td;
}

/**
 *
 * @param {Objwct} paper
 */
function paper_to_entries(paper) {
    let entries = [];
    // for (let owner in paper.owner) {
    // Create a row for each valid trade
    let entry = {
        issueDate: paper.issueDate,
        cusip: paper.cusip,
        ticker: paper.ticker,
        par: paper.par,
        quantity: 42,//paper.owner[owner].quantity,
        discount: paper.discount,
        maturity: paper.maturity,
        issuer: paper.issuer,
        owner: 'company' //paper.owner[owner].company
    };

        // Save which paper this is associated with
    entry.paper = paper;

    entries.push(entry);
    //}
    return entries;
}