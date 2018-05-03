npx composer identity issue --card admin@bsn-local -u AAI -a org.example.commercialpaper.Company#AAI
npx composer card import --file AAI@commercial-paper-network.card --card AAI@local
npx composer network ping --card AAI@local

npx composer identity issue --card admin@bsn-local -u BAH -a org.example.commercialpaper.Company#BAH
npx composer card import --file BAH@commercial-paper-network.card --card BAH@local
npx composer network ping --card BAH@local 

npx composer identity issue --card admin@bsn-local -u AMI -a org.example.commercialpaper.Company#AMI
npx composer card import --file AMI@commercial-paper-network.card --card AMI@local
npx composer network ping --card AMI@local 