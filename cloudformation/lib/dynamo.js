import cf from '@openaddresses/cloudfriend';

export default {
    Resources: {
        DDBTable: {
            Type: 'AWS::DynamoDB::Table',
            Properties: {
                TableName: cf.stackName,
                BillingMode: 'PAY_PER_REQUEST',
                AttributeDefinitions: [{
                    AttributeName: 'ServerUrl',
                    AttributeType: 'S'
                }],
                KeySchema: [{
                    AttributeName: 'ServerUrl',
                    KeyType: 'HASH'
                }],
            }
        },
        DDBServicesTable: {
            Type: 'AWS::DynamoDB::Table',
            Properties: {
                TableName: cf.join([cf.stackName, '-services']),
                BillingMode: 'PAY_PER_REQUEST',
                AttributeDefinitions: [{
                    AttributeName: 'ServiceName',
                    AttributeType: 'S'
                }],
                KeySchema: [{
                    AttributeName: 'ServiceName',
                    KeyType: 'HASH'
                }],
            }
        },
    }
};
