# API Specification (Mocked)

## AI CRM Platform API

These endpoints are currently simulated on the frontend using LocalStorage and the AI SDK UI layer, but are designed for backend integration.

### Authentication

#### POST /auth/login
- **Request Body**: `{ email, password }`
- **Response**: `{ id, email, name, token }`

#### POST /auth/signup
- **Request Body**: `{ email, name, password }`
- **Response**: `{ id, email, name, token }`

### Leads Management

#### GET /leads
- **Response**: `Lead[]`

#### POST /leads
- **Request Body**: `{ name, email, company, website, phone, status }`
- **Response**: `Lead`

#### PATCH /leads/:id
- **Request Body**: `Partial<Lead>`
- **Response**: `Lead`

#### DELETE /leads/:id
- **Response**: `204 No Content`

### AI & Security Services

#### POST /ai/analyze
- **Request Body**: `{ leadId }`
- **Response**: `{ quality: 'High' | 'Medium' | 'Low', qualityScore: number, analysis: string, suspicious: boolean }`

#### POST /ai/security-check
- **Request Body**: `{ leadId }`
- **Response**: `{ isRisky: boolean, securityFlags: string[], securityAnalysis: string }`

#### POST /ai/generate-email
- **Request Body**: `{ leadId, tone: 'professional' | 'casual' | 'aggressive' }`
- **Response**: `{ email: string }`

### Activities

#### GET /leads/:id/activities
- **Response**: `Activity[]`
