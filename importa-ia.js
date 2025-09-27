

skip to:contentpackage searchsign in
Pro
Teams
Pricing
Documentation
npm
Search packages
Search
openai
TypeScript icon, indicating that this package has built-in type declarations
5.23.1 • Public • Published 14 hours ago
OpenAI TypeScript and JavaScript API Library
NPM version npm bundle size JSR Version

This library provides convenient access to the OpenAI REST API from TypeScript or JavaScript.

It is generated from our OpenAPI specification with Stainless.

To learn how to use the OpenAI API, check out our API Reference and Documentation.

Installation
npm install openai
Installation from JSR
deno add jsr:@openai/openai
npx jsr add @openai/openai
These commands will make the module importable from the @openai/openai scope. You can also import directly from JSR without an install step if you're using the Deno JavaScript runtime:

import OpenAI from 'jsr:@openai/openai';
Usage
The full API of this library can be found in api.md file along with many code examples.

The primary API for interacting with OpenAI models is the Responses API. You can generate text from the model with the code below.

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

const response = await client.responses.create({
  model: 'gpt-4o',
  instructions: 'You are a coding assistant that talks like a pirate',
  input: 'Are semicolons optional in JavaScript?',
});

console.log(response.output_text);
The previous standard (supported indefinitely) for generating text is the Chat Completions API. You can use that API to generate text from the model with the code below.

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

const completion = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'developer', content: 'Talk like a pirate.' },
    { role: 'user', content: 'Are semicolons optional in JavaScript?' },
  ],
});

console.log(completion.choices[0].message.content);
Streaming responses
We provide support for streaming responses using Server Sent Events (SSE).

import OpenAI from 'openai';

const client = new OpenAI();

const stream = await client.responses.create({
  model: 'gpt-4o',
  input: 'Say "Sheep sleep deep" ten times fast!',
  stream: true,
});

for await (const event of stream) {
  console.log(event);
}
File uploads
Request parameters that correspond to file uploads can be passed in many different forms:

File (or an object with the same structure)
a fetch Response (or an object with the same structure)
an fs.ReadStream
the return value of our toFile helper
import fs from 'fs';
import OpenAI, { toFile } from 'openai';

const client = new OpenAI();

// If you have access to Node `fs` we recommend using `fs.createReadStream()`:
await client.files.create({ file: fs.createReadStream('input.jsonl'), purpose: 'fine-tune' });

// Or if you have the web `File` API you can pass a `File` instance:
await client.files.create({ file: new File(['my bytes'], 'input.jsonl'), purpose: 'fine-tune' });

// You can also pass a `fetch` `Response`:
await client.files.create({ file: await fetch('https://somesite/input.jsonl'), purpose: 'fine-tune' });

// Finally, if none of the above are convenient, you can use our `toFile` helper:
await client.files.create({
  file: await toFile(Buffer.from('my bytes'), 'input.jsonl'),
  purpose: 'fine-tune',
});
await client.files.create({
  file: await toFile(new Uint8Array([0, 1, 2]), 'input.jsonl'),
  purpose: 'fine-tune',
});
Webhook Verification
Verifying webhook signatures is optional but encouraged.

For more information about webhooks, see the API docs.

Parsing webhook payloads
For most use cases, you will likely want to verify the webhook and parse the payload at the same time. To achieve this, we provide the method client.webhooks.unwrap(), which parses a webhook request and verifies that it was sent by OpenAI. This method will throw an error if the signature is invalid.

Note that the body parameter must be the raw JSON string sent from the server (do not parse it first). The .unwrap() method will parse this JSON for you into an event object after verifying the webhook was sent from OpenAI.

import { headers } from 'next/headers';
import OpenAI from 'openai';

const client = new OpenAI({
  webhookSecret: process.env.OPENAI_WEBHOOK_SECRET, // env var used by default; explicit here.
});

export async function webhook(request: Request) {
  const headersList = headers();
  const body = await request.text();

  try {
    const event = client.webhooks.unwrap(body, headersList);

    switch (event.type) {
      case 'response.completed':
        console.log('Response completed:', event.data);
        break;
      case 'response.failed':
        console.log('Response failed:', event.data);
        break;
      default:
        console.log('Unhandled event type:', event.type);
    }

    return Response.json({ message: 'ok' });
  } catch (error) {
    console.error('Invalid webhook signature:', error);
    return new Response('Invalid signature', { status: 400 });
  }
}
Verifying webhook payloads directly
In some cases, you may want to verify the webhook separately from parsing the payload. If you prefer to handle these steps separately, we provide the method client.webhooks.verifySignature() to only verify the signature of a webhook request. Like .unwrap(), this method will throw an error if the signature is invalid.

Note that the body parameter must be the raw JSON string sent from the server (do not parse it first). You will then need to parse the body after verifying the signature.

import { headers } from 'next/headers';
import OpenAI from 'openai';

const client = new OpenAI({
  webhookSecret: process.env.OPENAI_WEBHOOK_SECRET, // env var used by default; explicit here.
});

export async function webhook(request: Request) {
  const headersList = headers();
  const body = await request.text();

  try {
    client.webhooks.verifySignature(body, headersList);

    // Parse the body after verification
    const event = JSON.parse(body);
    console.log('Verified event:', event);

    return Response.json({ message: 'ok' });
  } catch (error) {
    console.error('Invalid webhook signature:', error);
    return new Response('Invalid signature', { status: 400 });
  }
}
Handling errors
When the library is unable to connect to the API, or if the API returns a non-success status code (i.e., 4xx or 5xx response), a subclass of APIError will be thrown:

const job = await client.fineTuning.jobs
  .create({ model: 'gpt-4o', training_file: 'file-abc123' })
  .catch(async (err) => {
    if (err instanceof OpenAI.APIError) {
      console.log(err.request_id);
      console.log(err.status); // 400
      console.log(err.name); // BadRequestError
      console.log(err.headers); // {server: 'nginx', ...}
    } else {
      throw err;
    }
  });
Error codes are as follows:

Status Code	Error Type
400	BadRequestError
401	AuthenticationError
403	PermissionDeniedError
404	NotFoundError
422	UnprocessableEntityError
429	RateLimitError
>=500	InternalServerError
N/A	APIConnectionError
Request IDs
For more information on debugging requests, see these docs

All object responses in the SDK provide a _request_id property which is added from the x-request-id response header so that you can quickly log failing requests and report them back to OpenAI.

const completion = await client.chat.completions.create({
  messages: [{ role: 'user', content: 'Say this is a test' }],
  model: 'gpt-4o',
});
console.log(completion._request_id); // req_123
You can also access the Request ID using the .withResponse() method:

const { data: stream, request_id } = await openai.chat.completions
  .create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Say this is a test' }],
    stream: true,
  })
  .withResponse();
Realtime API
The Realtime API enables you to build low-latency, multi-modal conversational experiences. It currently supports text and audio as both input and output, as well as function calling through a WebSocket connection.

import { OpenAIRealtimeWebSocket } from 'openai/realtime/websocket';

const rt = new OpenAIRealtimeWebSocket({ model: 'gpt-realtime' });

rt.on('response.text.delta', (event) => process.stdout.write(event.delta));
For more information see realtime.md.

Microsoft Azure OpenAI
To use this library with Azure OpenAI, use the AzureOpenAI class instead of the OpenAI class.

[!IMPORTANT] The Azure API shape slightly differs from the core API shape which means that the static types for responses / params won't always be correct.

import { AzureOpenAI } from 'openai';
import { getBearerTokenProvider, DefaultAzureCredential } from '@azure/identity';

const credential = new DefaultAzureCredential();
const scope = 'https://cognitiveservices.azure.com/.default';
const azureADTokenProvider = getBearerTokenProvider(credential, scope);

const openai = new AzureOpenAI({ azureADTokenProvider });

const result = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Say hello!' }],
});

console.log(result.choices[0]!.message?.content);
Retries
Certain errors will be automatically retried 2 times by default, with a short exponential backoff. Connection errors (for example, due to a network connectivity problem), 408 Request Timeout, 409 Conflict, 429 Rate Limit, and >=500 Internal errors will all be retried by default.

You can use the maxRetries option to configure or disable this:

// Configure the default for all requests:
const client = new OpenAI({
  maxRetries: 0, // default is 2
});

// Or, configure per-request:
await client.chat.completions.create({ messages: [{ role: 'user', content: 'How can I get the name of the current day in JavaScript?' }], model: 'gpt-4o' }, {
  maxRetries: 5,
});
Timeouts
Requests time out after 10 minutes by default. You can configure this with a timeout option:

// Configure the default for all requests:
const client = new OpenAI({
  timeout: 20 * 1000, // 20 seconds (default is 10 minutes)
});

// Override per-request:
await client.chat.completions.create({ messages: [{ role: 'user', content: 'How can I list all files in a directory using Python?' }], model: 'gpt-4o' }, {
  timeout: 5 * 1000,
});
On timeout, an APIConnectionTimeoutError is thrown.

Note that requests which time out will be retried twice by default.

Request IDs
For more information on debugging requests, see these docs

All object responses in the SDK provide a _request_id property which is added from the x-request-id response header so that you can quickly log failing requests and report them back to OpenAI.

const response = await client.responses.create({ model: 'gpt-4o', input: 'testing 123' });
console.log(response._request_id); // req_123
You can also access the Request ID using the .withResponse() method:

const { data: stream, request_id } = await openai.responses
  .create({
    model: 'gpt-4o',
    input: 'Say this is a test',
    stream: true,
  })
  .withResponse();
Auto-pagination
List methods in the OpenAI API are paginated. You can use the for await … of syntax to iterate through items across all pages:

async function fetchAllFineTuningJobs(params) {
  const allFineTuningJobs = [];
  // Automatically fetches more pages as needed.
  for await (const fineTuningJob of client.fineTuning.jobs.list({ limit: 20 })) {
    allFineTuningJobs.push(fineTuningJob);
  }
  return allFineTuningJobs;
}
Alternatively, you can request a single page at a time:

let page = await client.fineTuning.jobs.list({ limit: 20 });
for (const fineTuningJob of page.data) {
  console.log(fineTuningJob);
}

// Convenience methods are provided for manually paginating:
while (page.hasNextPage()) {
  page = await page.getNextPage();
  // ...
}
Realtime API
The Realtime API enables you to build low-latency, multi-modal conversational experiences. It currently supports text and audio as both input and output, as well as function calling through a WebSocket connection.

import { OpenAIRealtimeWebSocket } from 'openai/realtime/websocket';

const rt = new OpenAIRealtimeWebSocket({ model: 'gpt-realtime' });

rt.on('response.text.delta', (event) => process.stdout.write(event.delta));
For more information see realtime.md.

Microsoft Azure OpenAI
To use this library with Azure OpenAI, use the AzureOpenAI class instead of the OpenAI class.

[!IMPORTANT] The Azure API shape slightly differs from the core API shape which means that the static types for responses / params won't always be correct.

import { AzureOpenAI } from 'openai';
import { getBearerTokenProvider, DefaultAzureCredential } from '@azure/identity';

const credential = new DefaultAzureCredential();
const scope = 'https://cognitiveservices.azure.com/.default';
const azureADTokenProvider = getBearerTokenProvider(credential, scope);

const openai = new AzureOpenAI({
  azureADTokenProvider,
  apiVersion: '<The API version, e.g. 2024-10-01-preview>',
});

const result = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Say hello!' }],
});

console.log(result.choices[0]!.message?.content);
For more information on support for the Azure API, see azure.md.

Advanced Usage
Accessing raw Response data (e.g., headers)
The "raw" Response returned by fetch() can be accessed through the .asResponse() method on the APIPromise type that all methods return. This method returns as soon as the headers for a successful response are received and does not consume the response body, so you are free to write custom parsing or streaming logic.

You can also use the .withResponse() method to get the raw Response along with the parsed data. Unlike .asResponse() this method consumes the body, returning once it is parsed.

const client = new OpenAI();

const httpResponse = await client.responses
  .create({ model: 'gpt-4o', input: 'say this is a test.' })
  .asResponse();

// access the underlying web standard Response object
console.log(httpResponse.headers.get('X-My-Header'));
console.log(httpResponse.statusText);

const { data: modelResponse, response: raw } = await client.responses
  .create({ model: 'gpt-4o', input: 'say this is a test.' })
  .withResponse();
console.log(raw.headers.get('X-My-Header'));
console.log(modelResponse);
Logging
[!IMPORTANT] All log messages are intended for debugging only. The format and content of log messages may change between releases.

Log levels
The log level can be configured in two ways:

Via the OPENAI_LOG environment variable
Using the logLevel client option (overrides the environment variable if set)
import OpenAI from 'openai';

const client = new OpenAI({
  logLevel: 'debug', // Show all log messages
});
Available log levels, from most to least verbose:

'debug' - Show debug messages, info, warnings, and errors
'info' - Show info messages, warnings, and errors
'warn' - Show warnings and errors (default)
'error' - Show only errors
'off' - Disable all logging
At the 'debug' level, all HTTP requests and responses are logged, including headers and bodies. Some authentication-related headers are redacted, but sensitive data in request and response bodies may still be visible.

Custom logger
By default, this library logs to globalThis.console. You can also provide a custom logger. Most logging libraries are supported, including pino, winston, bunyan, consola, signale, and @std/log. If your logger doesn't work, please open an issue.

When providing a custom logger, the logLevel option still controls which messages are emitted, messages below the configured level will not be sent to your logger.

import OpenAI from 'openai';
import pino from 'pino';

const logger = pino();

const client = new OpenAI({
  logger: logger.child({ name: 'OpenAI' }),
  logLevel: 'debug', // Send all messages to pino, allowing it to filter
});
Making custom/undocumented requests
This library is typed for convenient access to the documented API. If you need to access undocumented endpoints, params, or response properties, the library can still be used.

Undocumented endpoints
To make requests to undocumented endpoints, you can use client.get, client.post, and other HTTP verbs. Options on the client, such as retries, will be respected when making these requests.

await client.post('/some/path', {
  body: { some_prop: 'foo' },
  query: { some_query_arg: 'bar' },
});
Undocumented request params
To make requests using undocumented parameters, you may use // @ts-expect-error on the undocumented parameter. This library doesn't validate at runtime that the request matches the type, so any extra values you send will be sent as-is.

client.chat.completions.create({
  // ...
  // @ts-expect-error baz is not yet public
  baz: 'undocumented option',
});
For requests with the GET verb, any extra params will be in the query, all other requests will send the extra param in the body.

If you want to explicitly send an extra argument, you can do so with the query, body, and headers request options.

Undocumented response properties
To access undocumented response properties, you may access the response object with // @ts-expect-error on the response object, or cast the response object to the requisite type. Like the request params, we do not validate or strip extra properties from the response from the API.

Customizing the fetch client
If you want to use a different fetch function, you can either polyfill the global:

import fetch from 'my-fetch';

globalThis.fetch = fetch;
Or pass it to the client:

import OpenAI from 'openai';
import fetch from 'my-fetch';

const client = new OpenAI({ fetch });
Fetch options
If you want to set custom fetch options without overriding the fetch function, you can provide a fetchOptions object when instantiating the client or making a request. (Request-specific options override client options.)

import OpenAI from 'openai';

const client = new OpenAI({
  fetchOptions: {
    // `RequestInit` options
  },
});
Configuring proxies
To modify proxy behavior, you can provide custom fetchOptions that add runtime-specific proxy options to requests:

 Node [docs]

import OpenAI from 'openai';
import * as undici from 'undici';

const proxyAgent = new undici.ProxyAgent('http://localhost:8888');
const client = new OpenAI({
  fetchOptions: {
    dispatcher: proxyAgent,
  },
});
 Bun [docs]

import OpenAI from 'openai';

const client = new OpenAI({
  fetchOptions: {
    proxy: 'http://localhost:8888',
  },
});
 Deno [docs]

import OpenAI from 'npm:openai';

const httpClient = Deno.createHttpClient({ proxy: { url: 'http://localhost:8888' } });
const client = new OpenAI({
  fetchOptions: {
    client: httpClient,
  },
});
/*
Frequently Asked Questions
Semantic versioning
This package generally follows SemVer conventions, though certain backwards-incompatible changes may be released as minor versions:

Changes that only affect static types, without breaking runtime behavior.
Changes to library internals which are technically public but not intended or documented for external use. (Please open a GitHub issue to let us know if you are relying on such internals.)
Changes that we do not expect to impact the vast majority of users in practice.
We take backwards-compatibility seriously and work hard to ensure you can rely on a smooth upgrade experience.

We are keen for your feedback; please open an issue with questions, bugs, or suggestions.

Requirements
TypeScript >= 4.9 is supported.

The following runtimes are supported:

Node.js 20 LTS or later (non-EOL) versions.

Deno v1.28.0 or higher.

Bun 1.0 or later.

Cloudflare Workers.

Vercel Edge Runtime.

Jest 28 or greater with the "node" environment ("jsdom" is not supported at this time).

Nitro v2.6 or greater.

Web browsers: disabled by default to avoid exposing your secret API credentials. Enable browser support by explicitly setting dangerouslyAllowBrowser to true'.

More explanation
Note that React Native is not supported at this time.

If you are interested in other runtime environments, please open or upvote an issue on GitHub.

Contributing
See the contributing documentation.

Readme
Keywords
none
Package Sidebar
Install
npm i openai


Repository
github.com/openai/openai-node

Homepage
github.com/openai/openai-node#readme

Weekly Downloads
6,637,138

Version
5.23.1

License
Apache-2.0

Unpacked Size
6.66 MB

Total Files
1912

Last publish
14 hours ago

Collaborators
kwhinnery-openai
atty-openai
tibo-openai
dkundel-openai
mbolin-openai
fouad-openai
easong-openai
aibrahim-openai
apcha-oai
victor-openai
dschnurr
jeevnayak
knight-oai
dschnurr-openai
Try on RunKit
Report malware
Footer
Support
Help
Advisories
Status
Contact npm
Company
About
Blog
Press
Terms & Policies
Policies
Terms of Use
Code of Conduct
Privacy
