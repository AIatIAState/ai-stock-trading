import Grid from '@mui/material/Grid';
import type {Bar} from "../services/api.ts";
import {fetchStockPatterns} from "../services/StockPatternService.ts";


interface StockPatternRecognitionGridProps {
    data: Bar[]
}

export default function StockPatternRecognitionGrid(props: StockPatternRecognitionGridProps) {

    if (props.data.length <= 0){
        return <></>
    }
    const symbol : string = props.data[0].symbol
    const patterns = fetchStockPatterns(symbol, "daily")

    return (
        <Grid>

        </Grid>
    );
}
