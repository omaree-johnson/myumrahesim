eSIM Purchase Webhook
Request Body schema: application/json
eSIM purchase result

brand	
string
Brand of eSIM

confirmation	
object (dto.ESimConfirmation)
Confirmation of a completed eSIM transaction

cost	
integer
Cost of the eSIM to Partner

costCurrency	
string
Currency of cost to eSIM Partner

costCurrencyDivisor	
integer
Divisor for display of cost

country	
string
Destination country for eSIM offer (blank when eSIM offer is regional)

createdAt	
string
Date/time transaction was created

dataGB	
number
GB of data included in eSIM (0 when data is unlimited)

dataSpeeds	
Array of strings (dataSpeed)
Items Enum: "2G" "3G" "4G" "5G"
Data speeds available for eSIM

dataUnlimited	
boolean
Flag indicating whether data is unlimited on the eSIM

durationDays	
integer
Duration of the eSIM offer in days

error	
object (dto.Error)
Error information encountered while processing transaction

log	
Array of objects (dto.TransactionLogItem)
Trace log for fulfillment of transaction

notes	
string
Notes included about the eSIM offer

offerId	
string
Catalog ID of the offer (used for purchases)

price	
integer
Price to customer for eSIM (when using the zendit pricing module)

priceCurrency	
string
Currency of price charged to customer for eSIM (when using the zendit pricing module)

priceCurrencyDivisor	
integer
Divisor for display of price

priceType	
string (priceType)
Enum: "FIXED" "RANGE"
Price type for the eSIM (Fixed or Range)

productType	
string (productType)
Enum: "TOPUP" "VOUCHER" "ESIM" "RECHARGE_SANDBOX" "RECHARGE_WITH_CREDIT_CARD"
Product type for eSIM

regions	
Array of strings (regions)
Items Enum: "Global" "Africa" "Asia" "Caribbean" "Central America" "Eastern Europe" "Western Europe" "North America" "Oceania" "South America" "South Asia" "Southeast Asia" "Middle East and North Africa"
Regions for the eSIM

roaming	
Array of objects (dto.ESimRoaming)
Roaming information for regional eSIM products (empty array for NO ROAM eSIM offers)

shortNotes	
string
Short notes for eSIM offer

smsNumber	
integer
Included SMS messages with eSIM (0 when unlimited or not included, check smsUnlimited flag)

smsUnlimited	
boolean
Flag whether SMS messaging is unlimited for offer

status	
string (transactionStatus)
Enum: "DONE" "FAILED" "PENDING" "ACCEPTED" "AUTHORIZED" "IN_PROGRESS"
Status of transaction

subTypes	
Array of strings
Subtypes for the eSIM offer

transactionId	
string
Transaction Id provided by partner

updatedAt	
string
Date/Time of last update to transaction

value	
object (dto.PurchaseValue)
Value and type of price used for purchase of ranged products

voiceMinutes	
integer
Voice minutes included in eSIM offer (0 when unlimited or not included, check voiceUnlimited Flag)

voiceUnlimited	
boolean
Flag whether voice minutes are unlimited for the offer

Responses
200 Webhook processed successfully
500 Internal Server Error
Request samples
Payload
Content type
application/json

Copy
Expand allCollapse all
{
"brand": "string",
"confirmation": {
"activationCode": "string",
"externalReferenceId": "string",
"iccid": "string",
"redemptionInstructions": "string",
"smdpAddress": "string"
},
"cost": 0,
"costCurrency": "string",
"costCurrencyDivisor": 0,
"country": "string",
"createdAt": "string",
"dataGB": 0,
"dataSpeeds": [
"2G"
],
"dataUnlimited": true,
"durationDays": 0,
"error": {
"code": "string",
"description": "string",
"message": "string"
},
"log": [
{}
],
"notes": "string",
"offerId": "string",
"price": 0,
"priceCurrency": "string",
"priceCurrencyDivisor": 0,
"priceType": "FIXED",
"productType": "TOPUP",
"regions": [
"Global"
],
"roaming": [
{}
],
"shortNotes": "string",
"smsNumber": 0,
"smsUnlimited": true,
"status": "DONE",
"subTypes": [
"string"
],
"transactionId": "string",
"updatedAt": "string",
"value": {
"type": "PRICE",
"value": 0
},
"voiceMinutes": 0,
"voiceUnlimited": true
}
Get list of eSIM offers
Authorizations:
ApiKey
query Parameters
_limit
required
number
Number of items to return (Minimum 1, Maximum 1,024)

_offset
required
number
Number of items to skip - use with limit for pagination

brand	
string
Brand (Carrier for MTU) to filter

country	
string
2 letter ISO code for the destination country to filter

regions	
string (regions)
Enum: "Global" "Africa" "Asia" "Caribbean" "Central America" "Eastern Europe" "Western Europe" "North America" "Oceania" "South America" "South Asia" "Southeast Asia" "Middle East and North Africa"
String for the name of the region to filter

subType	
string
Offer subtype to filter

Responses
200 OK
400 Bad Request
401 Unauthorized - API Token Missing or Unrecognized
403 Forbidden - IP Not Allowed
500 Internal Server Error

get
/esim/offers
Request samples
Curl

Copy
curl -X GET\
-H "Authorization: Bearer [[accessToken]]"\
-H "Accept: application/json"\
"https://api.zendit.io/v1/esim/offers?_limit=&_offset=&brand=&country=®ions=&subType="
Response samples
200400401403500
Content type
application/json

Copy
Expand allCollapse all
{
"limit": 0,
"list": [
{}
],
"offset": 0,
"total": 0
}
Get an eSIM offer by the offer ID
Authorizations:
ApiKey
path Parameters
offerId
required
string
Catalog Id to find

Responses
200 OK
400 Bad Request
401 Unauthorized - API Token Missing or Unrecognized
403 Forbidden - IP Not Allowed
404 Not Found - Item not found
500 Internal Server Error

get
/esim/offers/{offerId}
Request samples
Curl

Copy
curl -X GET\
-H "Authorization: Bearer [[accessToken]]"\
-H "Accept: application/json"\
"https://api.zendit.io/v1/esim/offers/{offerId}"
Response samples
200400401403404500
Content type
application/json

Copy
Expand allCollapse all
{
"brand": "string",
"cost": {
"currency": "string",
"currencyDivisor": 0,
"fixed": 0,
"fx": 0,
"max": 0,
"min": 0
},
"country": "string",
"createdAt": "string",
"dataGB": 0,
"dataSpeeds": [
"2G"
],
"dataUnlimited": true,
"durationDays": 0,
"enabled": true,
"notes": "string",
"offerId": "string",
"price": {
"currency": "string",
"currencyDivisor": 0,
"fixed": 0,
"fx": 0,
"margin": 0,
"max": 0,
"min": 0,
"suggestedFixed": 0,
"suggestedFx": 0
},
"priceType": "FIXED",
"productType": "TOPUP",
"regions": [
"Global"
],
"roaming": [
{}
],
"shortNotes": "string",
"smsNumber": 0,
"smsUnlimited": true,
"subTypes": [
"string"
],
"updatedAt": "string",
"voiceMinutes": 0,
"voiceUnlimited": true
}
Get list of eSim transactions
Authorizations:
ApiKey
query Parameters
_limit
required
number
Number of items to retrieve (Minimum 1, Masimum 1,024)

_offset
required
integer
Number of items to skip - use with limit for pagination

createdAt	
string
Data filter - see Overview section for filtering by date

status	
string (transactionStatus)
Enum: "DONE" "FAILED" "PENDING" "ACCEPTED" "AUTHORIZED" "IN_PROGRESS"
Status to filter

Responses
200 OK
400 Bad Request
401 Unauthorized - API Token Missing or Unrecognized
403 Forbidden - IP Not Allowed
500 Internal Server Error

get
/esim/purchases
Request samples
Curl

Copy
curl -X GET\
-H "Authorization: Bearer [[accessToken]]"\
-H "Accept: application/json"\
"https://api.zendit.io/v1/esim/purchases?_limit=&_offset=&createdAt=&status="
Response samples
200400401403500
Content type
application/json

Copy
Expand allCollapse all
{
"limit": 0,
"list": [
{}
],
"offset": 0,
"total": 0
}
Purchase an eSIM offer for a new eSIM or add an offer to an existing eSIM
Authorizations:
ApiKey
Request Body schema: application/json
iccid	
string
ICCID to apply plan (omit to issue a new eSIM)

offerId
required
string
Catalog ID of the offer (used for purchases)

transactionId
required
string
Transaction Id provided by partner

Responses
200 OK
400 Bad Request
401 Unauthorized - API Token Missing or Unrecognized
403 Forbidden - IP Not Allowed
500 Internal Server Error

post
/esim/purchases
Request samples
PayloadCurl
Content type
application/json

Copy
{
"iccid": "string",
"offerId": "string",
"transactionId": "string"
}
Response samples
200400401403500
Content type
application/json

Copy
{
"status": "string",
"transactionId": "string"
}
Get eSim transaction by id
Authorizations:
ApiKey
path Parameters
transactionId
required
string
Transaction ID to find

Responses
200 OK
400 Bad Request
401 Unauthorized - API Token Missing or Unrecognized
403 Forbidden - IP Not Allowed
404 Not Found - Transaction not found
500 Internal Server Error

get
/esim/purchases/{transactionId}
Request samples
Curl

Copy
curl -X GET\
-H "Authorization: Bearer [[accessToken]]"\
-H "Accept: application/json"\
"https://api.zendit.io/v1/esim/purchases/{transactionId}"
Response samples
200400401403404500
Content type
application/json

Copy
Expand allCollapse all
{
"brand": "string",
"confirmation": {
"activationCode": "string",
"externalReferenceId": "string",
"iccid": "string",
"redemptionInstructions": "string",
"smdpAddress": "string"
},
"cost": 0,
"costCurrency": "string",
"costCurrencyDivisor": 0,
"country": "string",
"createdAt": "string",
"dataGB": 0,
"dataSpeeds": [
"2G"
],
"dataUnlimited": true,
"durationDays": 0,
"error": {
"code": "string",
"description": "string",
"message": "string"
},
"log": [
{}
],
"notes": "string",
"offerId": "string",
"price": 0,
"priceCurrency": "string",
"priceCurrencyDivisor": 0,
"priceType": "FIXED",
"productType": "TOPUP",
"regions": [
"Global"
],
"roaming": [
{}
],
"shortNotes": "string",
"smsNumber": 0,
"smsUnlimited": true,
"status": "DONE",
"subTypes": [
"string"
],
"transactionId": "string",
"updatedAt": "string",
"value": {
"type": "PRICE",
"value": 0
},
"voiceMinutes": 0,
"voiceUnlimited": true
}
Get eSim QR code by transaction id
Authorizations:
ApiKey
path Parameters
transactionId
required
string
Transaction ID to find

Responses
200 OK
400 Bad Request
401 Unauthorized - API Token Missing or Unrecognized
403 Forbidden - IP Not Allowed
404 Not Found - Transaction not found
500 Internal Server Error

get
/esim/purchases/{transactionId}/qrcode
Request samples
Curl

Copy
curl -X GET\
-H "Authorization: Bearer [[accessToken]]"\
-H "Accept: application/json"\
"https://api.zendit.io/v1/esim/purchases/{transactionId}/qrcode"
Response samples
200400401403404500
Content type

image/png
image/png
No sample
Retrieve usage of active and queued plans on an eSIM.
Authorizations:
ApiKey
path Parameters
iccId
required
string
Responses
200 OK
400 Bad Request
401 Unauthorized - API Token Missing or Unrecognized
403 Forbidden - IP Not Allowed
500 Internal Server Error

get
/esim/{iccId}/plans
Request samples
Curl

Copy
curl -X GET\
-H "Authorization: Bearer [[accessToken]]"\
-H "Accept: application/json"\
"https://api.zendit.io/v1/esim/{iccId}/plans" 
Response samples
200400401403500
Content type
application/json

Copy
Expand allCollapse all
{
"list": [
{}
],
"total": 0
}
Check status of transaction refund
Authorizations:
ApiKey
path Parameters
transactionId
required
string
Responses
200 OK
400 Bad Request
401 Unauthorized - API Token Missing or Unrecognized
403 Forbidden - IP Not Allowed
404 Not Found - Transaction not found
500 Internal Server Error

get
/esim/purchases/{transactionId}/refund
Response samples
200400401403404500
Content type
application/json

Copy
Expand allCollapse all
{
"amount": 0,
"createdAt": "string",
"currency": "string",
"error": {
"code": "string",
"description": "string",
"message": "string"
},
"log": [
{}
],
"productType": "TOPUP",
"refundedTransactionId": "string",
"status": "DONE",
"type": "DEBIT",
"updatedAt": "string"
}
Initiate a transaction refund
Authorizations:
ApiKey
path Parameters
transactionId
required
string
Responses
200 OK
400 Bad Request
401 Unauthorized - API Token Missing or Unrecognized
403 Forbidden - IP Not Allowed
404 Not Found - Transaction not found
500 Internal Server Error

post
/esim/purchases/{transactionId}/refund
Response samples
200400401403404500
Content type
application/json

Copy
{
"status": "DONE"
}