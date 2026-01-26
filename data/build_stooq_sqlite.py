import argparse
import csv
import sqlite3
import sys
import time
from pathlib import Path


def parse_exchange_and_asset(exchange_asset: str):
    parts = exchange_asset.split()
    if not parts:
        return None, None
    asset_type = parts[-1].lower()
    exchange = " ".join(parts[:-1]).lower() if len(parts) > 1 else None
    return exchange, asset_type


def iter_data_files(data_root: Path, timeframe_filter: set[str]):
    for timeframe_dir in data_root.iterdir():
        if not timeframe_dir.is_dir():
            continue
        timeframe_name = timeframe_dir.name.lower()
        if timeframe_name not in timeframe_filter:
            continue
        for country_dir in timeframe_dir.iterdir():
            if not country_dir.is_dir():
                continue
            for exchange_asset_dir in country_dir.iterdir():
                if not exchange_asset_dir.is_dir():
                    continue
                exchange, asset_type = parse_exchange_and_asset(exchange_asset_dir.name)
                for shard_dir in exchange_asset_dir.iterdir():
                    if not shard_dir.is_dir():
                        continue
                    for txt_file in shard_dir.glob("*.txt"):
                        yield {
                            "timeframe": timeframe_name,
                            "country": country_dir.name.lower(),
                            "exchange": exchange,
                            "asset_type": asset_type,
                            "path": txt_file,
                        }


def ensure_schema(conn: sqlite3.Connection):
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS symbols (
            symbol TEXT PRIMARY KEY,
            exchange TEXT,
            asset_type TEXT,
            country TEXT
        );
        CREATE TABLE IF NOT EXISTS bars (
            symbol TEXT NOT NULL,
            per TEXT NOT NULL,
            date INTEGER NOT NULL,
            time INTEGER NOT NULL,
            open REAL,
            high REAL,
            low REAL,
            close REAL,
            volume REAL,
            openint REAL,
            timeframe TEXT NOT NULL,
            exchange TEXT,
            asset_type TEXT,
            country TEXT
        );
        """
    )


def parse_row(row: list[str]):
    if len(row) < 10:
        return None
    return (
        row[0],
        row[1],
        int(row[2]),
        int(row[3]),
        float(row[4]) if row[4] else None,
        float(row[5]) if row[5] else None,
        float(row[6]) if row[6] else None,
        float(row[7]) if row[7] else None,
        float(row[8]) if row[8] else None,
        float(row[9]) if row[9] else None,
    )


def load_file(conn: sqlite3.Connection, meta: dict, batch_size: int = 5000):
    path = meta["path"]
    timeframe = meta["timeframe"]
    country = meta["country"]
    exchange = meta["exchange"]
    asset_type = meta["asset_type"]

    inserted = 0
    bad_rows = 0

    with path.open("r", newline="") as handle:
        reader = csv.reader(handle)
        header = next(reader, None)
        if not header or not header[0].startswith("<TICKER>"):
            handle.seek(0)
            reader = csv.reader(handle)

        batch = []
        for row in reader:
            parsed = parse_row(row)
            if not parsed:
                bad_rows += 1
                continue
            (
                symbol,
                per,
                date_value,
                time_value,
                open_value,
                high_value,
                low_value,
                close_value,
                volume_value,
                openint_value,
            ) = parsed

            batch.append(
                (
                    symbol,
                    per,
                    date_value,
                    time_value,
                    open_value,
                    high_value,
                    low_value,
                    close_value,
                    volume_value,
                    openint_value,
                    timeframe,
                    exchange,
                    asset_type,
                    country,
                )
            )
            if len(batch) >= batch_size:
                changes_before = conn.total_changes
                conn.executemany(
                    """
                    INSERT INTO bars (
                        symbol, per, date, time, open, high, low, close, volume, openint,
                        timeframe, exchange, asset_type, country
                    )
                    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    WHERE NOT EXISTS (
                        SELECT 1 FROM bars WHERE symbol = ? AND date = ? AND time = ? AND timeframe = ?
                    )
                    """,
                    [
                        (*row, row[0], row[2], row[3], row[10])
                        for row in batch
                    ],
                )
                bars_inserted = conn.total_changes - changes_before
                conn.executemany(
                    "INSERT OR IGNORE INTO symbols (symbol, exchange, asset_type, country) VALUES (?, ?, ?, ?)",
                    [(row[0], exchange, asset_type, country) for row in batch],
                )
                inserted += bars_inserted
                batch = []

        if batch:
            changes_before = conn.total_changes
            conn.executemany(
                """
                INSERT INTO bars (
                    symbol, per, date, time, open, high, low, close, volume, openint,
                    timeframe, exchange, asset_type, country
                )
                SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                WHERE NOT EXISTS (
                    SELECT 1 FROM bars WHERE symbol = ? AND date = ? AND time = ? AND timeframe = ?
                )
                """,
                [
                    (*row, row[0], row[2], row[3], row[10])
                    for row in batch
                ],
            )
            bars_inserted = conn.total_changes - changes_before
            conn.executemany(
                "INSERT OR IGNORE INTO symbols (symbol, exchange, asset_type, country) VALUES (?, ?, ?, ?)",
                [(row[0], exchange, asset_type, country) for row in batch],
            )
            inserted += bars_inserted

    return inserted, bad_rows


def create_indexes(conn: sqlite3.Connection):
    conn.executescript(
        """
        DROP INDEX IF EXISTS idx_bars_symbol_date_time;
        CREATE INDEX IF NOT EXISTS idx_bars_symbol_timeframe_date_time
        ON bars (symbol, timeframe, date, time);

        CREATE INDEX IF NOT EXISTS idx_bars_timeframe
        ON bars (timeframe);

        CREATE INDEX IF NOT EXISTS idx_bars_exchange_asset
        ON bars (exchange, asset_type);
        """
    )


def main():
    parser = argparse.ArgumentParser(description="Build a SQLite DB from Stooq ASCII files.")
    parser.add_argument(
        "--data-root",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "data",
        help="Root data directory (default: ./data).",
    )
    parser.add_argument(
        "--db-path",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "data" / "stocks.db",
        help="SQLite DB output path.",
    )
    parser.add_argument(
        "--timeframes",
        default="daily,hourly,5 min",
        help="Comma-separated timeframe folders to load (default: 'daily,hourly,5 min').",
    )
    parser.add_argument(
        "--limit-files",
        type=int,
        default=0,
        help="Limit number of files processed (0 = no limit).",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=5000,
        help="Rows per insert batch.",
    )

    args = parser.parse_args()
    data_root = args.data_root
    if not data_root.exists():
        print(f"Data root not found: {data_root}")
        return 1

    timeframe_filter = {t.strip().lower() for t in args.timeframes.split(",") if t.strip()}
    files = list(iter_data_files(data_root, timeframe_filter))
    if args.limit_files:
        files = files[: args.limit_files]

    if not files:
        print("No data files found for the selected timeframes.")
        return 1

    args.db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(args.db_path)
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA synchronous = OFF")
    conn.execute("PRAGMA temp_store = MEMORY")

    ensure_schema(conn)

    total_inserted = 0
    total_bad = 0
    start = time.time()

    with conn:
        for idx, meta in enumerate(files, start=1):
            inserted, bad_rows = load_file(conn, meta, batch_size=args.batch_size)
            total_inserted += inserted
            total_bad += bad_rows
            if idx % 25 == 0 or idx == len(files):
                elapsed = time.time() - start
                print(
                    f"[{idx}/{len(files)}] {meta['path'].name} "
                    f"rows={inserted} bad={bad_rows} total={total_inserted} "
                    f"elapsed={elapsed:,.1f}s"
                )

    create_indexes(conn)
    conn.close()

    elapsed = time.time() - start
    print(
        f"Done. Inserted {total_inserted:,} rows with {total_bad:,} bad rows "
        f"in {elapsed:,.1f}s. DB: {args.db_path}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
