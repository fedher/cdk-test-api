import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as TestFapi from '../lib/test-fapi-stack';

test('Empty Stack', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new TestFapi.TestFapiStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {},
      },
      MatchStyle.EXACT,
    ),
  );
});
