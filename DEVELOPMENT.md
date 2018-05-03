type Owner struct {
	Company  string    `json:"company"`
	Quantity int      `json:"quantity"`
}

type CP struct {
	CUSIP     string  `json:"cusip"`
	Ticker    string  `json:"ticker"`
	Par       float64 `json:"par"`
	Qty       int     `json:"qty"`
	Discount  float64 `json:"discount"`
	Maturity  int     `json:"maturity"`
	Owners    []Owner `json:"owner"`
	Issuer    string  `json:"issuer"`
	IssueDate string  `json:"issueDate"`
}

type Account struct {
	ID          string  `json:"id"`
	Prefix      string  `json:"prefix"`
	CashBalance float64 `json:"cashBalance"`
	AssetsIds   []string `json:"assetIds"`
}

type Transaction struct {
	CUSIP       string   `json:"cusip"`
	FromCompany string   `json:"fromCompany"`
	ToCompany   string   `json:"toCompany"`
	Quantity    int      `json:"quantity"`
	Discount    float64  `json:"discount"`
}

CURRENCY


## Txs

Creating accounts for the the ids who can trade CPs
Issue the Commerical Paper

Transfer the CP

CUISP logic [](https://en.wikipedia.org/wiki/CUSIP)

func generateCUSIPSuffix(issueDate string, days int) (string, error) {

	t, err := msToTime(issueDate)
	if err != nil {
		return "", err
	}

	maturityDate := t.AddDate(0, 0, days)
	month := int(maturityDate.Month())
	day := maturityDate.Day()

	suffix := seventhDigit[month] + eigthDigit[day]
	return suffix, nil

}

## ?
Generic to currency  - how common is the model across different standards and geos

http://www.investinganswers.com/financial-dictionary/bonds/par-value-2020


```golang
	// If fromCompany doesn't own this paper
	if ownerFound == false {
		fmt.Println("The company " + tr.FromCompany + "doesn't own any of this paper")
		return nil, errors.New("The company " + tr.FromCompany + "doesn't own any of this paper")
	} else {
		fmt.Println("The FromCompany does own this paper")
	}

	// If fromCompany doesn't own enough quantity of this paper
	if quantity < tr.Quantity {
		fmt.Println("The company " + tr.FromCompany + "doesn't own enough of this paper")
		return nil, errors.New("The company " + tr.FromCompany + "doesn't own enough of this paper")
	} else {
		fmt.Println("The FromCompany owns enough of this paper")
	}

	amountToBeTransferred := float64(tr.Quantity) * cp.Par
	amountToBeTransferred -= (amountToBeTransferred) * (cp.Discount / 100.0) * (float64(cp.Maturity) / 360.0)

	// If toCompany doesn't have enough cash to buy the papers
	if toCompany.CashBalance < amountToBeTransferred {
		fmt.Println("The company " + tr.ToCompany + "doesn't have enough cash to purchase the papers")
		return nil, errors.New("The company " + tr.ToCompany + "doesn't have enough cash to purchase the papers")
	} else {
		fmt.Println("The ToCompany has enough money to be transferred for this paper")
	}

	toCompany.CashBalance -= amountToBeTransferred
	fromCompany.CashBalance += amountToBeTransferred

	toOwnerFound := false
	for key, owner := range cp.Owners {
		if owner.Company == tr.FromCompany {
			fmt.Println("Reducing Quantity from the FromCompany")
			cp.Owners[key].Quantity -= tr.Quantity
			//			owner.Quantity -= tr.Quantity
		}
		if owner.Company == tr.ToCompany {
			fmt.Println("Increasing Quantity from the ToCompany")
			toOwnerFound = true
			cp.Owners[key].Quantity += tr.Quantity
			//			owner.Quantity += tr.Quantity
		}
	}

	if toOwnerFound == false {
		var newOwner Owner
		fmt.Println("As ToOwner was not found, appending the owner to the CP")
		newOwner.Quantity = tr.Quantity
		newOwner.Company = tr.ToCompany
		cp.Owners = append(cp.Owners, newOwner)
	}

	fromCompany.AssetsIds = append(fromCompany.AssetsIds, tr.CUSIP)
```    