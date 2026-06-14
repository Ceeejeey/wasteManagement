from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    """
    User model representing registered users of the system.
    Stores authentication details and tracks the total accumulated green points.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String(20), default="user") # E.g. 'user', 'admin'
    points = Column(Integer, default=0) # Total points available for spending
    
    # Timestamps for auditing
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # One-to-many relationship with WasteLog and SpendLog.
    # cascade="all, delete" ensures logs are removed if the user is deleted.
    waste_logs = relationship("WasteLog", back_populates="user", cascade="all, delete")
    spend_logs = relationship("SpendLog", back_populates="user", cascade="all, delete")

class WasteLog(Base):
    """
    WasteLog model representing a successful waste detection event.
    Logs the type of waste identified and the points earned by the user.
    """
    __tablename__ = "waste_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    waste_type = Column(String(100), nullable=False) # e.g. 'plastic_bottle'
    points_earned = Column(Integer, nullable=False)
    detected_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship back to the User model
    user = relationship("User", back_populates="waste_logs")

class SpendLog(Base):
    """
    SpendLog model representing a transaction where a user spends points.
    Tracks the amount spent and an optional description of what was purchased.
    """
    __tablename__ = "spend_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    amount = Column(Integer, nullable=False) # Points deducted
    spent_on = Column(String(150), nullable=True) # Description of purchase (e.g. 'Coffee')
    spent_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship back to the User model
    user = relationship("User", back_populates="spend_logs")
