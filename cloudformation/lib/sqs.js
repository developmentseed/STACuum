import cf from '@openaddresses/cloudfriend';

export default {
    Resources: {
        SQSIngest: {
            Type: 'AWS::SQS::Queue',
            Properties: {
                QueueName: cf.join('-', [cf.stackName, cf.accountId, cf.region]),
            }
        }
    }
};
