import * as cdk from '@aws-cdk/core';

import * as lambda from '@aws-cdk/aws-lambda';
import { Duration, Stack } from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';

import * as apigateway from '@aws-cdk/aws-apigateway';
import { DomainName, BasePathMapping, CfnAuthorizer } from '@aws-cdk/aws-apigateway';

export class TestFapiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // const CORS = [`https://secure.${environment}.prepaytolls.com`, `http://localhost:4200`];
    const cors = ['*'];

    const handler = new lambda.Function(this, 'contact-us', {
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: Duration.seconds(120),
      code: lambda.Code.asset('lambdas.zip'),
      handler: 'src/contact.main',
      memorySize: 128,
      environment: {
        CORS: JSON.stringify(cors),
      },
    });

    handler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['es:*'],
        resources: ['*'],
      }),
    );

    handler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['events:PutEvents'],
        resources: ['*'],
      }),
    );

    const api = new apigateway.LambdaRestApi(this, 'contact-us-api', {
      handler,
      restApiName: 'Contact Us',
      description: 'Service to get the customer contact email',
      deployOptions: { stageName: 'prod' },
      defaultMethodOptions: {
        apiKeyRequired: false,
      },
      proxy: false,
    });

    const proxy = api.root.addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(handler),
      anyMethod: false,
    });

    proxy.addMethod('POST', undefined);
    this.addCorsOpts(proxy);
  }

  private addCorsOpts(apiResource: apigateway.IResource) {
    apiResource.addMethod(
      'OPTIONS',
      new apigateway.MockIntegration({
        integrationResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers':
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
              'method.response.header.Access-Control-Allow-Origin': "'*'",
              'method.response.header.Access-Control-Allow-Credentials': "'false'",
              'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,POST'", // modify this based on methods
            },
          },
        ],
        passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_MATCH,
        requestTemplates: {
          'application/json': '{"statusCode": 200}',
        },
      }),
      {
        methodResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': true,
              'method.response.header.Access-Control-Allow-Methods': true,
              'method.response.header.Access-Control-Allow-Credentials': true, // COGNITO
              'method.response.header.Access-Control-Allow-Origin': true,
            },
          },
        ],
      },
    );
  }
}
