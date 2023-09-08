import cf from '@openaddresses/cloudfriend';

export default {
    Resrouces: {
        RestFunction: {
            Type: 'AWS::Lambda::Function',
            Properties: {
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
