class ValidationError(Exception):
    """Custom validation error"""
    pass

class InsufficientWoolError(Exception):
    """Raised when user doesn't have enough wool"""
    pass

class NotFoundException(Exception):
    """Raised when resource not found"""
    pass
