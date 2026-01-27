## ADDED Requirements

### Requirement: Custom Avatar Upload

The system SHALL allow users to upload a custom avatar image when creating an agent.

The system SHALL:
- Display an upload button ("+") in the avatar selection grid
- Accept image files in formats: jpg, jpeg, png, gif, webp
- Limit file size to a maximum of 5MB
- Upload the file to the backend via `POST /api/agents/avatar`
- Display upload progress/loading state during upload
- Add the uploaded avatar to the selection grid upon success
- Automatically select the uploaded avatar
- Display error message if upload fails

#### Scenario: User uploads a valid image

- **WHEN** user clicks the "+" button in avatar selection
- **THEN** a file picker dialog opens
- **WHEN** user selects a valid image file (jpg/png/gif/webp, <5MB)
- **THEN** the system shows a loading indicator
- **WHEN** upload completes successfully
- **THEN** the uploaded avatar appears in the grid with custom styling
- **AND** the uploaded avatar is automatically selected

#### Scenario: User uploads an invalid file type

- **WHEN** user selects a file that is not a supported image format
- **THEN** the system rejects the file without uploading
- **AND** shows an error message indicating supported formats

#### Scenario: User uploads a file exceeding size limit

- **WHEN** user selects an image larger than 5MB
- **THEN** the system rejects the file without uploading
- **AND** shows an error message indicating the size limit

#### Scenario: Upload fails due to server error

- **WHEN** the upload API returns an error
- **THEN** the system displays an error message
- **AND** allows the user to retry

### Requirement: Custom Avatar Display

The system SHALL display custom uploaded avatars distinctly from preset avatars.

The system SHALL:
- Apply a default background color for custom avatars
- Display custom avatars in the same grid layout as preset avatars
- Maintain the uploaded avatar URL for form submission

#### Scenario: Custom avatar in selection grid

- **WHEN** a custom avatar has been uploaded
- **THEN** it appears as a selectable option in the avatar grid
- **AND** uses a distinct visual style (e.g., different border or background)

