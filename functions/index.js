// Copyright 2016, Google, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const functions = require('firebase-functions');
const {actionssdk} = require('actions-on-google');

const faasshell = require('./commit-count-report.js');

const app = actionssdk({debug: true});

app.intent('actions.intent.MAIN', (conv) => {
  conv.ask('<speak>Hi! <break time="1"/> ' +
    'I can read out an ordinal like ' +
    '<say-as interpret-as="ordinal">123</say-as>. Say a number.</speak>');
});


app.intent('actions.intent.TEXT', (conv, input) => {
  if (input === 'bye') {
    return conv.close('Goodbye!');
  }
  return faasshell.commit_count_report().then(([res, body]) => {
    conv.ask('<speak>You said, ' +
             `<say-as interpret-as="ordinal">${input}</say-as></speak>`);
    const report = JSON.parse(body).output.github.output.values[0];
    conv.ask('commit count report returned '
             + report[0] + ' contributed '
             + report[5].toString() + ' commits to '
             + report[2] + ' repository.')
  });
});

exports.webhook = functions.https.onRequest(app);
