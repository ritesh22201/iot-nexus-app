import pino from 'pino';
const logger = pino({ name: 'iot-nexus-simulator' });
logger.info(
  'Simulator scaffold ready. Telemetry generation and MQTT publishing are planned for Phase 2.',
);
