import Cognito from '@aws-sdk/client-cognito-identity';
import SQS from '@aws-sdk/client-sqs';
import CognitoProvider from '@aws-sdk/client-cognito-identity-provider';
import Dynamo from '@aws-sdk/client-dynamodb';
import DynamoDBDoc from "@aws-sdk/lib-dynamodb";
import cors from 'cors';

for (const env of ['UserPoolId', 'ClientId', 'StackName', 'GitSha', 'IngestQueue']) {
    if (!process.env[env]) throw new Error(`${env} Env Var Required`);
}

const app = express();

const cognito = new Cognito.CognitoIdentityClient();
const provider = new CognitoProvider.CognitoIdentityProvider();

app.use('*', cors({
    origin: true
}));

app.post('/login', async (req, res) => {
    if (event.body.ChallengeResponse) {
        if (!event.body.ChallengeName) throw new Error('ChallengeName required');
        if (!event.body.Session) throw new Error('Session required');

        const res = await provider.adminRespondToAuthChallenge({
            UserPoolId: process.env.UserPoolId,
            ClientId: process.env.ClientId,
            ChallengeName: event.body.ChallengeName,
            ChallengeResponses: {
                USERNAME: event.body.ChallengeResponse.USERNAME,
                NEW_PASSWORD: event.body.ChallengeResponse.NEW_PASSWORD
            },
            Session: event.body.Session
        });

        return response({ message: 'Challenge Accepted' }, 200);
    } else {
        console.error(process.env.UserPoolId, process.env.ClientId);
        const auth = await provider.adminInitiateAuth({
            UserPoolId: process.env.UserPoolId,
            ClientId: process.env.ClientId,
            AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
            AuthParameters: {
                USERNAME: event.body.Username,
                PASSWORD: event.body.Password
            }
        });

        if (auth.ChallengeName) {
            return response({
                ChallengeName: auth.ChallengeName,
                ChallengeParameters: auth.ChallengeParameters,
                Session: auth.Session
            }, 200);
        }

        const user = await provider.getUser({
            AccessToken: auth.AuthenticationResult.AccessToken
        });

        const attrs = {};
        for (const attr of req.auth.UserAttributes) {
            attrs[attr.Name] = attr.Value;
        }

        return response({
            username: req.auth.Username,
            email: attrs.email,
            token: auth.AuthenticationResult.AccessToken
        })
    }
});

app.use(async (req, res, next) => {
    // Auth - All Endpoints past this point require Auth
    if (!req.headers.Authorization) {
        return res.status(401).json({ message: 'No Authorization Header Provided' });
    }

    try {
        req.auth = await provider.getUser({
            AccessToken: event.headers.Authorization.split(' ')[1]
        });
    } catch (err) {
        return res.status(401).json({ message: err.message });
    }

    return next();
});

app.get('/login', async (req, res) => {
    const attrs = {};
    for (const attr of req.auth.UserAttributes) {
        attrs[attr.Name] = attr.Value;
    }

    return res.json({
        username: req.auth.Username,
        email: attrs.email
    })
});

app.post('/ingest', async (req, res) => {
    const sqs = new SQS.SQSClient({});

    await sqs.send(new SQS.SendMessageCommand({
        QueueUrl: process.env.IngestQueue,
        MessageBody: JSON.stringify(event.body)
    }));

    return res.json({
        message: 'Ingesting'
    })
});

app.get('/ingest', async (req, res) => {
    const dynamo = DynamoDBDoc.DynamoDBDocumentClient.from(new Dynamo.DynamoDBClient({
        region: process.env.AWS_REGION || 'us-east-1'
    }));

    const list = await dynamo.send(new DynamoDBDoc.ScanCommand({
        TableName: process.env.StackName,
    }));


    return res.json({
        servers: list.Items
    });
});

const handler = serverless(app);

const startServer = async () => {
    app.listen(3000, () => {
        console.log("listening on port 3000!");
    });
}

startServer();

export {
    handler
};
