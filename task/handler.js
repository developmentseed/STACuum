import crypto from 'node:crypto';
import EsriDump from 'esri-dump';
import Dynamo from '@aws-sdk/client-dynamodb';
import DynamoDBDoc from "@aws-sdk/lib-dynamodb";

if (!process.env.StackName) process.env.StackName = 'stacuum-prod';

export async function handler(event) {
    for (const record of event.Records) {
        try {
            const event = JSON.parse(record.body);

            const dynamo = DynamoDBDoc.DynamoDBDocumentClient.from(new Dynamo.DynamoDBClient({
                region: process.env.AWS_REGION || 'us-east-1'
            }));

            event.url = event.url.replace(/arcgis\/rest\/services.*/, '/arcgis/rest/services/');

            const row = await dynamo.send(new DynamoDBDoc.GetCommand({
                TableName: process.env.StackName,
                Key: {
                    ServerUrl: event.url
                }
            }));

            let Item = row.Item;

            if (!row.Item) {
                Item = {
                    UUID: crypto.randomUUID(),
                    ServerName: event.name,
                    ServerUrl: event.url,
                    LastUpdated: String(new Date())
                }

                await dynamo.send(new DynamoDBDoc.PutCommand({
                    TableName: process.env.StackName,
                    Item
                }));
            }

            const esri = new EsriDump(Item.ServerUrl, {
                approach: 'iter',
                headers: event.headers || {}
            });

            const queue = [];

            esri.on('error', (err) => {
                throw err;
            }).on('layer', (layer) => {
                queue.push(layer);
            }).on('done', async () => {
                for (const q of queue) {
                    await dynamo.send(new DynamoDBDoc.PutCommand({
                        TableName: process.env.StackName + '-services',
                        Item: {
                            Type: q.type,
                            ServiceName: q.name,
                            Description: q.description,
                            GeometryType: q.geometryType,
                            Extent: q.extent,
                            Schema: q.schema,
                            Original: q
                        }
                    }));
                }
            });

            await esri.discover();
        } catch (err) {
            throw err;
        }
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    if (!process.argv[2]) {
        console.error('./handler.js <URL>');
        process.exit()
    }

    const res = await handler({
        Records: [{
            body: JSON.stringify({
                url: process.argv[2]
            })
        }]
    });
}
