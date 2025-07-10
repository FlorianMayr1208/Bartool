from fastapi import FastAPI

app = FastAPI(title="Bar Management")

@app.get("/healthz")
async def health_check():
    return {"status": "ok"}


@app.get("/")
async def root():
    return {"message": "hello world"}
