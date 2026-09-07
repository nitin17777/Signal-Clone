"""Alembic environment script — configured for SQLAlchemy 2.0 async with aiosqlite."""

import asyncio
import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

# ---------------------------------------------------------------------------
# Make `app` importable when Alembic is run from backend/
# ---------------------------------------------------------------------------
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

# Import app settings (reads .env if present)
from app.core.config import settings  # noqa: E402

# Import all models so Alembic discovers every table via Base.metadata
import app.models  # noqa: E402, F401  (side-effect import)
from app.db.session import Base  # noqa: E402

# ---------------------------------------------------------------------------
# Alembic Config object (gives access to alembic.ini values / logging)
# ---------------------------------------------------------------------------
config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


# ---------------------------------------------------------------------------
# Offline migration (no live DB connection needed)
# ---------------------------------------------------------------------------
def run_migrations_offline() -> None:
    """Emit SQL to stdout without connecting to the DB."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=True,  # required for SQLite ALTER TABLE emulation
    )
    with context.begin_transaction():
        context.run_migrations()


# ---------------------------------------------------------------------------
# Online migration (connects to the DB)
# ---------------------------------------------------------------------------
def do_run_migrations(connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        render_as_batch=True,  # required for SQLite ALTER TABLE emulation
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Create the async engine and run migrations within an async context."""
    connectable = create_async_engine(settings.DATABASE_URL, future=True)
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
