const fs             = require('fs');
const assert         = require('assert');

const app = require('../../src/app');

const errorTelemetryService = 'telemetry/error';

describe('\'ErrorTelemetry\' service', () => {
  it('registered the service', () => {
    const service = app.service(errorTelemetryService);

    assert.ok(service, 'Registered the service');
  });
});

describe('Error Telemetry', () => {
  it('should fail with empty parameters', () => {
    const service = app.service(errorTelemetryService);
    return service.create()
      .then(() => assert.fail('Should have failed to create()'))
      .catch((err) => assert.ok(err.message.match('^A data object must be provided')));
  });

  it('missing fields should be rejected', async () => {
    const service = app.service(errorTelemetryService);

    const badQueries = [
      'blah',
      {'log':{'version': 1 }},
      {'log':{'timestamp': 1526387942 }}
    ];
    for ( const badQuery in badQueries ) {
      try {
        await service.create(badQuery);
        assert.fail('Should have failed above');
      } catch (err) {
        // expected
      }
    }

  });

  it('should create a log', async () => {
    const service = app.service(errorTelemetryService);
    const response = await service.create({
      log: {
        version: 1,
        timestamp: 1522840762769,
        name: 'io.jenkins.plugins.SomeTypicalClass',
        level: 'WARNING',
        message: 'the message\nand another line',
      }
    });

    assert.ok(response, 'A log should have been stored');
    assert.equal(response.status, 'OK', 'The log should have been stored');

    const fileContent = fs.readFileSync('/tmp/blah');
    assert.notEqual(fileContent, '', 'Log file should not be empty');

  });

});
