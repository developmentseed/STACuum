import cf from '@openaddresses/cloudfriend';

export default {
    Resources: {
        DDBTable: {
            Type: 'AWS::DynamoDB::Table',
            Properties: {
                TableName: cf.stackName,
                AttributeDefinitions: [{
                    AttributeName: 'ServerName',
                    AttributeType: 'N'
                },{
                    AttributeName: 'ServerUrl',
                    AttributeType: 'N'
                },{
                    AttributeName: 'LastUpdated',
                    AttributeType: 'N'
                },{
                    AttributeName: 'Id',
                    AttributeType: 'S'
                }],
                KeySchema: [{
                    AttributeName: 'ServerName',
                    KeyType: 'HASH'
                },{
                    AttributeName: 'Id',
                    KeyType: 'RANGE'
                }],
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            }
        },
        DDBWriteCapacityScalableTarget: {
            Type: 'AWS::ApplicationAutoScaling::ScalableTarget',
            Properties: {
                MaxCapacity: 30,
                MinCapacity: 5,
                ResourceId: cf.join('/', ['table', cf.ref('DDBTable')]),
                RoleARN: cf.getAtt('DDBScalingRole', 'Arn'),
                ScalableDimension: 'dynamodb:table:WriteCapacityUnits',
                ServiceNamespace: 'dynamodb'
            }
        },
        DDBScalingRole: {
            Type: 'AWS::IAM::Role',
            Properties: {
                AssumeRolePolicyDocument: {
                    Version: '2012-10-17',
                    Statement: [{
                        Effect: 'Allow',
                        Principal: {
                            Service: ['application-autoscaling.amazonaws.com']
                        },
                        Action: ['sts:AssumeRole']
                    }]
                },
                Path: '/',
                Policies: [{
                    PolicyName: 'root',
                    PolicyDocument: {
                        Version: '2012-10-17',
                        Statement: [{
                            Effect: 'Allow',
                            Action: [
                                'dynamodb:DescribeTable',
                                'dynamodb:UpdateTable',
                                'cloudwatch:PutMetricAlarm',
                                'cloudwatch:DescribeAlarms',
                                'cloudwatch:GetMetricStatistics',
                                'cloudwatch:SetAlarmState',
                                'cloudwatch:DeleteAlarms'
                            ],
                            Resource: '*'
                        }]
                    }
                }]
            }
        },
        DDBWriteScalingPolicy: {
            Type: 'AWS::ApplicationAutoScaling::ScalingPolicy',
            Properties: {
                PolicyName: 'WriteAutoScalingPolicy',
                PolicyType: 'TargetTrackingScaling',
                ScalingTargetId: cf.ref('DDBWriteCapacityScalableTarget'),
                TargetTrackingScalingPolicyConfiguration: {
                    TargetValue: 75.0,
                    ScaleInCooldown: 60,
                    ScaleOutCooldown: 60,
                    PredefinedMetricSpecification: {
                        PredefinedMetricType: 'DynamoDBWriteCapacityUtilization'
                    }
                }
            }
        }
    }
};
