import cf from '@openaddresses/cloudfriend';

export default {
    Resources: {
        SQSIngestMapping: {
            Type: 'AWS::Lambda::EventSourceMapping',
            DependsOn: ['TaskFunction'],
            Properties: {
                BatchSize: 1,
                Enabled: true,
                EventSourceArn: cf.getAtt('SQSIngest', 'Arn'),
                FunctionName: cf.join('-', [cf.stackName, 'task']),
                FunctionResponseTypes: ['ReportBatchItemFailures']
            }
        },
        TaskFunction: {
            Type: 'AWS::Lambda::Function',
            Properties: {
                FunctionName: cf.join('-', [cf.stackName, 'task']),
                Code: {
                    ImageUri: cf.join([cf.accountId, '.dkr.ecr.', cf.region, '.amazonaws.com/stacuum:task-', cf.ref('GitSha')]),
                },
                PackageType: 'Image',
                MemorySize: 1024,
                Role: cf.getAtt('FunctionRole', 'Arn'),
                Timeout: 240,
                Environment: {
                    Variables: {
                        StackName: cf.stackName,
                        GitSha: cf.ref('GitSha'),
                    }
                }
            }
        },
    },
}
