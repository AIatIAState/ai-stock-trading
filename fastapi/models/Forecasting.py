from darts import TimeSeries
import pandas as pd
from darts.dataprocessing.transformers import Scaler, MissingValuesFiller
from darts.models import NBEATSModel, TransformerModel, TFTModel, RNNModel, ARIMA, \
    ExponentialSmoothing, RegressionEnsembleModel, RandomForestModel
from darts.utils.likelihood_models import QuantileRegression
from matplotlib import pyplot as plt

from Connector import get_connection


def get_forecast(symbol, timeframe, forecast_length=30):
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

    rows = [{'date': dict(row)['date'], 'open': dict(row)['open']} for row in rows]

    df = pd.DataFrame(rows)
    df['open'] = df['open'].ffill()
    df['date'] = pd.to_datetime(df['date'].astype(str), format='%Y%m%d')
    ts = TimeSeries.from_dataframe(df, time_col='date', value_cols='open', fill_missing_dates=True, freq='D')

    # Resample to different frequency
    ts_weekly = ts.resample('W')


    scaler = Scaler()
    ts = scaler.fit_transform(ts)

    # Fill missing values with dart
    filler = MissingValuesFiller(fill='auto')
    ts = filler.transform(ts)


    #ARIMA, ExponentialSmooth= Statistics Models
    #RandomForest, GBM = ML approaches
    #RNN, LSTM, NBEATS = DL approaches


    #Weighted Ensemble
    regression_ensemble = RegressionEnsembleModel(
        forecasting_models=[
            ExponentialSmoothing(),
            ARIMA(),
            RandomForestModel(lags=12, output_chunk_length=1),
            RNNModel(model='LSTM', input_chunk_length=24, output_chunk_length=12, n_epochs=1, random_state=42),
            TFTModel(input_chunk_length=24, output_chunk_length=12, n_epochs=1, random_state=42, add_relative_index=True),
            TransformerModel(input_chunk_length=24, output_chunk_length=12, n_epochs=1, random_state=42),
            NBEATSModel(input_chunk_length=24, output_chunk_length=12, n_epochs=1, random_state=42),
        ],
        regression_train_n_points = 50
    )

    print("Training Started")
    regression_ensemble.fit(ts)

    print("Prediction Started")
    forecast_ensemble = regression_ensemble.predict(n=forecast_length)


    print("Plotting Started")
    ts.plot(label='Actual')
    plt.title("Actual")
    plt.show()
    forecast_ensemble.plot(label='Forecast')
    plt.title('Time Series Forecast')
    plt.show()

    return {'results': forecast_ensemble}

get_forecast("AAPL.US", "daily")