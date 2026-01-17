# Recipe Reunion Backend

FastAPI backend for Recipe Reunion - preserving family recipes across generations.

## Quick Start

### 1. Install dependencies
```bash
uv sync
```

### 2. Run the server
```bash
uv run uvicorn main:app --reload
```

Server runs at `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

## Project Structure

```
app/
├── __init__.py
├── config.py              # Configuration & settings
├── models.py              # SQLAlchemy models
├── schemas.py             # Pydantic schemas
├── database.py            # Database setup
├── auth/
│   ├── __init__.py
│   ├── security.py        # Password hashing & JWT (Deeptanshu)
│   └── routes.py          # Auth endpoints (Deeptanshu)
└── api/
    ├── __init__.py
    ├── recipes.py         # Recipe CRUD (Imran)
    └── cookbooks.py       # Cookbook CRUD & sharing (Imran)
```

## Task Division

### Imran: Core API & Database
**Focus**: Recipe and Cookbook management

**Tasks**:
- [ ] Create Recipe model (id, title, ingredients, instructions, created_by, created_at)
- [ ] Create Cookbook model (id, name, owner_id, created_at)
- [ ] Create CookbookMember model (cookbook_id, user_id, role)
- [ ] Implement Recipe CRUD endpoints in `app/api/recipes.py`
  - `GET /recipes/` - List recipes (with filtering by cookbook)
  - `POST /recipes/` - Create recipe
  - `GET /recipes/{id}` - Get recipe
  - `PUT /recipes/{id}` - Update recipe
  - `DELETE /recipes/{id}` - Delete recipe
- [ ] Implement Cookbook CRUD endpoints in `app/api/cookbooks.py`
  - `GET /cookbooks/` - List user's cookbooks
  - `POST /cookbooks/` - Create cookbook
  - `GET /cookbooks/{id}` - Get cookbook with recipes
  - `PUT /cookbooks/{id}` - Update cookbook
  - `DELETE /cookbooks/{id}` - Delete cookbook
  - `POST /cookbooks/{id}/members` - Add family member to cookbook
- [ ] Add database constraints and relationships
- [ ] Write tests for CRUD operations

**Deliverables**:
- Working Recipe and Cookbook models
- All CRUD endpoints functional
- Tests passing

---

### Deeptanshu: Authentication & Security
**Focus**: User authentication and authorization

**Tasks**:
- [ ] Implement password hashing in `app/auth/security.py`
  - `hash_password(password)` - Hash using bcrypt
  - `verify_password(plain, hashed)` - Verify password
- [ ] Implement JWT token utilities in `app/auth/security.py`
  - `create_access_token(data, expires_delta)` - Generate JWT
  - `decode_token(token)` - Validate and decode JWT
- [ ] Implement auth endpoints in `app/auth/routes.py`
  - `POST /auth/register` - Register new user
  - `POST /auth/login` - Login and get token
  - `POST /auth/refresh` - Refresh token (optional for MVP)
- [ ] Create auth dependency for protected routes
  - `get_current_user()` - Dependency to extract user from token
- [ ] Add auth middleware to protect endpoints
- [ ] Write tests for auth flows

**Deliverables**:
- Working registration and login
- JWT tokens generated and validated
- Auth tests passing
- Documentation of auth flow

---

## Integration Points (Both Work Together)

After individual tasks are complete:

1. **Protect routes with auth**
   - Add `current_user: User = Depends(get_current_user)` to endpoints
   - Verify user owns/has access to resources

2. **Role-based access control (RBAC)**
   - Admin: Full access to cookbook
   - Member: Read-only or specific permissions
   - Owner: Full control

3. **Test integration**
   - Auth + Recipe CRUD
   - Auth + Cookbook sharing

## API Endpoints Overview

### Authentication
```
POST   /auth/register      - Register new user
POST   /auth/login         - Login (returns token)
POST   /auth/refresh       - Refresh token
```

### Recipes
```
GET    /recipes/           - List recipes
POST   /recipes/           - Create recipe
GET    /recipes/{id}       - Get recipe
PUT    /recipes/{id}       - Update recipe
DELETE /recipes/{id}       - Delete recipe
```

### Cookbooks
```
GET    /cookbooks/         - List user's cookbooks
POST   /cookbooks/         - Create cookbook
GET    /cookbooks/{id}     - Get cookbook
PUT    /cookbooks/{id}     - Update cookbook
DELETE /cookbooks/{id}     - Delete cookbook
POST   /cookbooks/{id}/members - Add member
```

## Development Commands

### Run tests
```bash
uv run pytest
```

### Run with auto-reload
```bash
uv run uvicorn main:app --reload
```

### Format code
```bash
uv run black app/
```

## Environment Variables

Create `.env` file (not tracked in git):
```
DATABASE_URL=sqlite:///./recipe_reunion.db
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Notes

- Using SQLite for development (easy to test)
- JWT tokens expire after 30 minutes
- Passwords hashed with bcrypt
- CORS enabled for frontend at `localhost:5173`
