import jwt
import logging
from typing import Optional
from fastapi import Request, Depends
from app.config import settings

logger = logging.getLogger(__name__)

# Cache JWKS
JWKS_URL = "https://api.clerk.com/v1/jwks"
# We lazily initialize the JWK client to handle cases where secret key isn't set yet
_jwks_client = None

def get_jwks_client() -> Optional[jwt.PyJWKClient]:
    global _jwks_client
    if _jwks_client is not None:
        return _jwks_client
    
    if not settings.clerk_secret_key:
        logger.warning("CLERK_SECRET_KEY is not set. Authentication will fail.")
        return None

    # Clerk requires the secret key to access the JWKS endpoint
    _jwks_client = jwt.PyJWKClient(
        JWKS_URL, 
        headers={"Authorization": f"Bearer {settings.clerk_secret_key}"}
    )
    return _jwks_client

async def get_optional_user(request: Request) -> Optional[str]:
    """
    Extracts the Clerk JWT from the Authorization header and verifies it.
    Returns the user ID (sub) if valid, or None if missing/invalid.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
        
    token = auth_header.split(" ")[1]
    client = get_jwks_client()
    
    if not client:
        return None
        
    try:
        signing_key = client.get_signing_key_from_jwt(token)
        data = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        return data.get("sub")
    except Exception as e:
        logger.warning(f"JWT Verification failed: {e}")
        return None
