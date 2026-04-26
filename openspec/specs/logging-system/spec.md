## ADDED Requirements

### Requirement: Log levels
The system SHALL support four log levels: DEBUG, INFO, WARN, and ERROR.

#### Scenario: Log level hierarchy
- **WHEN** the log level is set to INFO
- **THEN** the system SHALL log INFO, WARN, and ERROR messages
- **AND** SHALL NOT log DEBUG messages

#### Scenario: Production log level
- **WHEN** running in production mode
- **THEN** the default log level SHALL be INFO

#### Scenario: Development log level
- **WHEN** running in development mode
- **THEN** the default log level SHALL be DEBUG

### Requirement: Frontend logging
The system SHALL provide a logging API for frontend code.

#### Scenario: Log info message
- **WHEN** code calls `logger.info(message, context?)`
- **THEN** the system SHALL log the message at INFO level
- **AND** include optional context object if provided

#### Scenario: Log error with stack trace
- **WHEN** code calls `logger.error(message, error?)`
- **THEN** the system SHALL log the message at ERROR level
- **AND** include the error stack trace if an Error object is provided

#### Scenario: Log performance warning
- **WHEN** code calls `logger.warn(message, metrics?)`
- **THEN** the system SHALL log the message at WARN level
- **AND** include performance metrics if provided

### Requirement: Backend logging
The system SHALL provide a logging API for Rust backend code.

#### Scenario: Rust log info
- **WHEN** Rust code calls `info!(message)`
- **THEN** the system SHALL log the message at INFO level
- **AND** write to stdout in development mode

#### Scenario: Rust log error
- **WHEN** Rust code calls `error!(message)`
- **THEN** the system SHALL log the message at ERROR level
- **AND** write to both stdout and log file

### Requirement: Log persistence
The system SHALL persist logs to local files for later analysis.

#### Scenario: Log file location
- **WHEN** the application starts
- **THEN** logs SHALL be written to `~/.seven-md/logs/app-{YYYY-MM-DD}.log`

#### Scenario: Log file rotation
- **WHEN** a new day starts
- **THEN** the system SHALL create a new log file for the new day
- **AND** keep logs from the previous 7 days
- **AND** delete logs older than 7 days

#### Scenario: Frontend log persistence
- **WHEN** frontend code logs a message at WARN or ERROR level
- **THEN** the system SHALL write the log to the backend log file via Tauri IPC
- **AND** batch write logs every 5 seconds for performance

#### Scenario: Immediate error log write
- **WHEN** an ERROR level log is written
- **THEN** the system SHALL immediately flush to the log file
- **AND** not wait for batch write interval

### Requirement: Log format
The system SHALL use a structured log format.

#### Scenario: Log entry format
- **WHEN** a log entry is written
- **THEN** it SHALL follow this format:
  ```
  [YYYY-MM-DD HH:mm:ss.SSS] [LEVEL] [CONTEXT] message
  ```

#### Scenario: Context in logs
- **WHEN** a log includes context data
- **THEN** the context SHALL be formatted as JSON
- **AND** appended to the log message

### Requirement: Log querying
The system SHALL provide ability to query logs for debugging.

#### Scenario: View recent logs
- **WHEN** developer opens the developer tools
- **THEN** the last 100 log entries SHALL be visible in the console

#### Scenario: Filter logs by level
- **WHEN** developer sets a log level filter
- **THEN** only logs at or above that level SHALL be displayed
