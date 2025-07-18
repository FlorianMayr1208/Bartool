from fastapi import APIRouter

from ..services import macros as macros_service

router = APIRouter()

@router.get('/', response_model=list[str])
def list_macros():
    """Return all available flavour macros."""
    return macros_service.list_macros()

