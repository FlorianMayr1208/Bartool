from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import shutil

from ..db.session import DATABASE_URL

router = APIRouter()

_DB_PATH = Path(DATABASE_URL.replace("sqlite:///", ""))


@router.get("/export")
def export_db():
    if not _DB_PATH.exists():
        raise HTTPException(status_code=404, detail="Database not found")
    return FileResponse(_DB_PATH, filename=_DB_PATH.name, media_type="application/octet-stream")


@router.post("/import", status_code=201)
async def import_db(file: UploadFile = File(...)):
    with _DB_PATH.open("wb") as dest:
        shutil.copyfileobj(file.file, dest)
    return {"status": "imported"}
