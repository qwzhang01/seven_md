## ADDED Requirements

### Requirement: Layout adapts seamlessly during fullscreen transitions
The system SHALL ensure the layout adapts correctly during fullscreen entry and exit transitions without producing blank areas or visual artifacts.

#### Scenario: No blank area during fullscreen entry
- **WHEN** the user enters fullscreen mode
- **THEN** the layout SHALL expand smoothly to fill the entire screen
- **AND** no dark/blank area SHALL appear at the bottom of the screen during or after the transition
- **AND** the StatusBar SHALL remain anchored to the very bottom of the screen

#### Scenario: No blank area during fullscreen exit
- **WHEN** the user exits fullscreen mode
- **THEN** the layout SHALL shrink smoothly to match the normal window size
- **AND** no visual artifacts or blank areas SHALL appear during the transition

#### Scenario: TitleBar height transition on fullscreen change
- **WHEN** the fullscreen state changes
- **THEN** the TitleBar height SHALL transition between 0px (fullscreen) and 38px (normal)
- **AND** the remaining layout elements SHALL redistribute the reclaimed/given height without layout shift
