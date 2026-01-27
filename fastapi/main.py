import os
import sqlite3
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

DB_PATH = Path(os.getenv("DB_PATH", Path(__file__).resolve().parents[1] / "data" / "stocks.db"))
MAX_LIMIT = 5000

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_connection():
    if not DB_PATH.exists():
        raise HTTPException(status_code=500, detail=f"Database not found at {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/symbols")
def search_symbols(q: str = Query(..., min_length=1), limit: int = Query(25, ge=1, le=500)):
    query = q.strip().upper()
    conn = get_connection()
    try:
        rows = conn.execute(
            """
            SELECT symbol, exchange, asset_type, country
            FROM symbols
            WHERE symbol LIKE ?
            ORDER BY symbol
            LIMIT ?
            """,
            (f"{query}%", limit),
        ).fetchall()
    finally:
        conn.close()

    return {"results": [dict(row) for row in rows]}


@app.get("/api/bars")
def get_bars(
    symbol: str = Query(..., min_length=1),
    timeframe: str = Query("daily"),
    start: int | None = Query(None, description="YYYYMMDD"),
    end: int | None = Query(None, description="YYYYMMDD"),
    order: str = Query("desc", description="Sort order: asc or desc"),
    limit: int = Query(500, ge=1, le=MAX_LIMIT),
):
    symbol_value = symbol.strip().upper()
    timeframe_value = timeframe.strip().lower()
    order_value = order.strip().lower()

    if order_value not in ("asc", "desc"):
        raise HTTPException(status_code=400, detail="order must be 'asc' or 'desc'")
    order_sql = "ASC" if order_value == "asc" else "DESC"

    where = ["symbol = ?", "timeframe = ?"]
    params: list[object] = [symbol_value, timeframe_value]

    if start is not None:
        where.append("date >= ?")
        params.append(start)
    if end is not None:
        where.append("date <= ?")
        params.append(end)

    sql = f"""
        SELECT symbol, per, date, time, open, high, low, close, volume, openint, timeframe
        FROM bars
        WHERE {' AND '.join(where)}
        ORDER BY date {order_sql}, time {order_sql}
        LIMIT ?
    """
    params.append(limit)

    conn = get_connection()
    try:
        rows = conn.execute(sql, params).fetchall()
    finally:
        conn.close()

    return {"results": [dict(row) for row in rows]}
