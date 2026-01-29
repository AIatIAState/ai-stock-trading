# Using Data Time Warping (DTW) to calculate the distance between two time series segments and assign a similarity (confidence) score.
# This will help us identify previous segments of a stock value that is similar to the current trend.
from dtaidistance import dtw

from Connector import get_connection


def get_dtw_patterns(symbol, timeframe, trend_segment_length=15, min_similarity_score=95):
    where = ["symbol = ?", "timeframe = ?"]
    sql = f"""
        SELECT symbol, per, date, time, open, high, low, close, volume, openint, timeframe
        FROM bars
        WHERE {' AND '.join(where)}
        ORDER BY date {"ASC"}, time {"DESC"}
    """
    params: list[object] = [symbol, timeframe]
    conn = get_connection()
    try:
        rows = conn.execute(sql, params).fetchall()
    finally:
        conn.close()

    rows = [dict(row) for row in rows]
    opens = []
    dates = []
    for row in rows:
        opens.append(row['open'])
        dates.append(row['date'])
    current_segment = opens[-30:]
    past_segment = opens[:-30]

    similar_paths = []

    for i in range(len(past_segment) - trend_segment_length - 1):

        distance= dtw.distance(current_segment, past_segment[i:i+trend_segment_length], use_c=False)
        similarity_score = distance / trend_segment_length
        if similarity_score > min_similarity_score:
            similar_paths.append({"starting_date": dates[i], "similarity_score": similarity_score})

    return {"results": similar_paths}

