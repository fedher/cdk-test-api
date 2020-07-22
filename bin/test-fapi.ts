#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { TestFapiStack } from '../lib/test-fapi-stack';

const app = new cdk.App();
new TestFapiStack(app, 'TestFapiStack');
