Email To DID Service

API: lookupEmail (email)

Steps:

1.Check ENS txt list [email. DID] for email

If exists: 
2.return DID
Else:
    2.Create new DID + priv key pair
    3.Store priv key in bucket
    4.Create one-time download link
    5.Email one-time download link to {email}
    6.return DID

    Async- When the download link is clicked:

    7.Delete key from the bucket
    8.Write key-value pair [email, DID] to the txt record (Costs Gas)


API: RegisterEmail (email)

Steps:

1.Check ENS txt list for email

If exists: 
2.return DID

Else:
    2.Create new DID + priv key pair
    3.Store priv key in bucket
    4.Create one-time download link
    5.Email one-time download link to {email}
    6.return DID and private key

    Async- When the download link is clicked:

    6.Delete key from the bucket
    7.Write key-value pair [email, DID] to the txt record (Costs Gas)
