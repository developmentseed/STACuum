import cf from '@openaddresses/cloudfriend';
import S3 from './lib/s3.js';
import UI from './lib/ui.js';
import SQS from './lib/sqs.js';
import Task from './lib/task.js';
import CloudFront from './lib/cloudfront.js';
import Cognito from './lib/cognito.js';

export default cf.merge(
    Task,
    SQS,
    S3,
    UI,
    Cognito,
    CloudFront,
    {
        Description: 'Template for @developmentseed/segment-anything-geo',
        Parameters: {
            GitSha: {
                Description: 'GitSha that is currently being deployed',
                Type: 'String'
            },
            RootDomain: {
                Description: 'Root Domain For the Frontend',
                Type: 'String'
            },
            RootDomainCertificate: {
                Description: 'Root Domain Certificate',
                Type: 'String'
            },
            RootDomainHostedZoneId: {
                Description: 'Root Domain Zone ID',
                Type: 'String'
            },
        }
    },
);
