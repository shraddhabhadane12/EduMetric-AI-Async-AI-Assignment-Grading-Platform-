from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass


# Inheriting from Base tells SQLAlchemy:
# This class represents a table that can be created in the database
