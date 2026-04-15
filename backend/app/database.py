from supabase import create_client, Client
from app.config import SUPABASE_URL, SUPABASE_ANON_KEY

_client: Client | None = None
_disabled: bool = False


def get_supabase() -> Client | None:
    """Return the Supabase client, or None if credentials are not configured."""
    global _client, _disabled
    if _disabled:
        return None
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_ANON_KEY:
            _disabled = True
            return None
        _client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    return _client
