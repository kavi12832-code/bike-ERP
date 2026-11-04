"""RFC 6238 time-based one-time passwords (Google Authenticator, Microsoft Authenticator, ...)."""
import base64
import hashlib
import hmac
import secrets
import struct
import time
from urllib.parse import quote

STEP_SECONDS = 30
DIGITS = 6


def new_secret():
    return base64.b32encode(secrets.token_bytes(20)).decode().rstrip('=')


def _code(secret, counter):
    key = base64.b32decode(secret + '=' * (-len(secret) % 8), casefold=True)
    digest = hmac.new(key, struct.pack('>Q', counter), hashlib.sha1).digest()
    offset = digest[-1] & 0x0F
    value = struct.unpack('>I', digest[offset:offset + 4])[0] & 0x7FFFFFFF
    return str(value % 10 ** DIGITS).zfill(DIGITS)


def now_code(secret, at=None):
    return _code(secret, int((at or time.time()) // STEP_SECONDS))


def verify(secret, code, at=None, window=1):
    """Accepts the current code and one step either side (clock drift)."""
    if not secret or not code or not str(code).isdigit():
        return False
    counter = int((at or time.time()) // STEP_SECONDS)
    return any(hmac.compare_digest(_code(secret, counter + d), str(code)) for d in range(-window, window + 1))


def provisioning_uri(secret, account, issuer):
    label = quote(f'{issuer}:{account}')
    return f'otpauth://totp/{label}?secret={secret}&issuer={quote(issuer)}&digits={DIGITS}&period={STEP_SECONDS}'
