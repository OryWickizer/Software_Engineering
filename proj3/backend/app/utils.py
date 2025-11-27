import secrets
from pydantic import SecretStr
import hashlib
from passlib.context import CryptContext
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# fix password encryption after testing
DEV_PLAINTEXT = os.getenv("DEV_PLAINTEXT_PASSWORDS", "0") == "1"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _unwrap_secret(password):
    if isinstance(password, SecretStr):
        return password.get_secret_value()
    return password


def hash_password(password):
    password = _unwrap_secret(password)
    if DEV_PLAINTEXT:
        # In dev mode, return the raw password so it gets stored plaintext (NOT for prod)
        return password
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    plain = _unwrap_secret(plain_password)

    print("verify_password types:", type(plain), type(hashed_password))
    print("hashed_password repr:", repr(hashed_password))

    if (
        DEV_PLAINTEXT
        and isinstance(hashed_password, str)
        and not hashed_password.startswith("$2")
    ):
        return plain == hashed_password

    try:
        return pwd_context.verify(plain, hashed_password)
    except ValueError:
        if DEV_PLAINTEXT:
            return plain == hashed_password
        raise


def generate_verification_token() -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(32)


def create_verification_token_hash(email: str, token: str) -> str:
    """Create a hash of email + token for verification"""
    return hashlib.sha256(f"{email}{token}".encode()).hexdigest()


def send_verification_email(email: str, token: str, user_type: str = "user"):
    """Send (or simulate sending) verification email"""
    BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
    verification_link = (
        f"{BASE_URL}/api/auth/verify?email={email}&token={token}&type={user_type}"
    )

    # If SMTP configuration is not provided, fall back to printing the link.
    SMTP_SERVER = os.getenv("SMTP_SERVER")
    if not SMTP_SERVER:
        print(f"✅ Verification link for {email}: {verification_link}")
        return True

    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SENDER_EMAIL = os.getenv("SENDER_EMAIL")
    SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")
    USE_SSL = os.getenv("SMTP_USE_SSL", "0") == "1"
    USE_TLS = os.getenv("SMTP_USE_TLS", "1") == "1"

    # Build email
    subject = "Verify your Taste Buddiez account"
    text = (
        f"Please verify your email by visiting the link:"
        f"{verification_link}\n\nThis link expires in 24 hours."
    )
    html = f"""
    <html>
      <body>
        <h2>Verify your Taste Buddiez account</h2>
        <p>Click the button below to verify your email address for your account.</p>
        <p><a href=\"{verification_link}\" style=\"background:#f97316;color:#fff;padding:10px 16px;
        border-radius:6px;text-decoration:none;\">Verify Email</a></p>
        <p>If the button doesn't work, paste this link into your browser:</p>
        <p>{verification_link}</p>
      </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = SENDER_EMAIL or "noreply@localhost"
    msg["To"] = email

    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")
    msg.attach(part1)
    msg.attach(part2)

    try:
        if USE_SSL:
            server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, timeout=10)
        else:
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10)
        server.ehlo()
        if not USE_SSL and USE_TLS:
            server.starttls()
            server.ehlo()

        if SENDER_EMAIL and SENDER_PASSWORD:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)

        server.send_message(msg)
        server.quit()
        print(f"✅ Sent verification email to {email}")
        return True
    except Exception as e:
        print(f"⚠️ Failed to send verification email to {email}: {e}")
        # Fallback: print the link so developer can copy it from logs
        print(f"Fallback verification link for {email}: {verification_link}")
        return False
