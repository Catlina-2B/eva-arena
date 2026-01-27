## ADDED Requirements

### Requirement: Default Font Family
The application SHALL use Source Code Pro as the default font for all body text, including paragraphs, labels, buttons, headings h3-h6, and general UI elements.

#### Scenario: Body text rendering
- **WHEN** any text content is rendered (excluding h1 and h2)
- **THEN** the text MUST be displayed using Source Code Pro font

#### Scenario: Button and label text
- **WHEN** buttons, labels, or form elements are rendered
- **THEN** they MUST use Source Code Pro font

### Requirement: Display Font for H1 and H2 Only
The application SHALL use Ethnocentric font exclusively for h1 and h2 heading elements via CSS rules. All other headings (h3-h6) SHALL use Source Code Pro.

#### Scenario: H1 heading rendering
- **WHEN** an h1 element is rendered
- **THEN** the text MUST be rendered using Ethnocentric font automatically via CSS

#### Scenario: H2 heading rendering
- **WHEN** an h2 element is rendered
- **THEN** the text MUST be rendered using Ethnocentric font automatically via CSS

#### Scenario: H3-H6 heading rendering
- **WHEN** an h3, h4, h5, or h6 element is rendered
- **THEN** the text MUST use Source Code Pro (default font)

### Requirement: Local Font Loading
The application SHALL load Source Code Pro font from the local `/front/Source_Code_Pro/` directory using @font-face declarations with variable font support.

#### Scenario: Variable weight support
- **WHEN** the font is loaded
- **THEN** it MUST support weights from 200 to 900 via variable font technology

#### Scenario: Italic variant
- **WHEN** italic text is required
- **THEN** the Source Code Pro Italic variable font MUST be available

