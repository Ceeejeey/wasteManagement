from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database connection URL for PostgreSQL
# Format: postgresql://<username>:<password>@<host>/<database_name>
DATABASE_URL = "postgresql://postgres:1234@localhost/Waste_Management"

# Create the SQLAlchemy engine which handles the connection pool and dialect communication
engine = create_engine(DATABASE_URL)

# Create a configured "Session" class
# autocommit=False ensures transactions are not automatically committed
# autoflush=False prevents automatic flushing of pending changes before queries
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative class definitions (used by models to inherit from)
Base = declarative_base()
