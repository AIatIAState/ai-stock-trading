import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import type {GridCellParams, GridRowsProp, GridColDef} from '@mui/x-data-grid';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';

type SparkLineData = number[];

function getDaysInMonth(month: number, year: number) {
  const date = new Date(year, month, 0);
  const monthName = date.toLocaleDateString('en-US', {
    month: 'short',
  });
  const daysInMonth = date.getDate();
  const days = [];
  let i = 1;
  while (days.length < daysInMonth) {
    days.push(`${monthName} ${i}`);
    i += 1;
  }
  return days;
}

function renderSparklineCell(params: GridCellParams<SparkLineData, any>) {
  const data = getDaysInMonth(4, 2024);
  const { value, colDef } = params;

  if (!value || value.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <SparkLineChart
        data={value}
        width={colDef.computedWidth || 100}
        height={32}
        plotType="bar"
        showHighlight
        showTooltip
        color="hsl(210, 98%, 42%)"
        xAxis={{
          scaleType: 'band',
          data,
        }}
      />
    </div>
  );
}

function renderAction(Action: 'Buy' | 'Sell') {
  const colors: { [index: string]: 'success' | 'default' } = {
    Buy: 'success',
    Sell: 'default',
  };

  return <Chip label={Action} color={colors[Action]} size="small" />;
}

export function renderAvatar(
  params: GridCellParams<{ name: string; color: string }, any, any>,
) {
  if (params.value == null) {
    return '';
  }

  return (
    <Avatar
      sx={{
        backgroundColor: params.value.color,
        width: '24px',
        height: '24px',
        fontSize: '0.85rem',
      }}
    >
      {params.value.name.toUpperCase().substring(0, 1)}
    </Avatar>
  );
}

export const columns: GridColDef[] = [
  { field: 'stockTitle', headerName: 'Stock Option', flex: 1.5, minWidth: 200 },
  {
    field: 'action',
    headerName: 'Action',
    flex: 0.5,
    minWidth: 80,
    renderCell: (params) => renderAction(params.value as any),
  },
  {
    field: 'amount',
    headerName: 'Amount',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 80,
  },
    {
        field: 'projection',
        headerName: 'Projected Returns',
        headerAlign: 'right',
        align: 'right',
        flex: 1,
        minWidth: 80,
    },
  {
    field: 'confidence',
    headerName: 'Confidence',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'stockValue',
    headerName: 'Stock Value',
    flex: 1,
    minWidth: 150,
    renderCell: renderSparklineCell,
  },
];

export const rows: GridRowsProp = [
  {
    id: 1,
    stockTitle: 'Stock Option #1',
      action: 'Buy',
    amount: 204,
      projection: 400,
      confidence: 60,
    stockValue: [
      469172, 488506, 592287, 617401, 640374, 632751, 668638, 807246, 749198, 944863,
      911787, 844815, 992022, 1143838, 1446926, 1267886, 1362511, 1348746, 1560533,
      1670690, 1695142, 1916613, 1823306, 1683646, 2025965, 2529989, 3263473,
      3296541, 3041524, 2599497,
    ],
  },
  {
    id: 2,
    stockTitle: 'Stock Option #2',
      action: 'Buy',
    amount: 204,
      projection: 400,
      confidence: 79,
    stockValue: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      557488, 1341471, 2044561, 2206438,
    ],
  },
  {
    id: 3,
    stockTitle: 'Stock Option #3',
      action: 'Sell',
      amount: 204,
      projection: 400,
      confidence: 89,
    stockValue: [
      166896, 190041, 248686, 226746, 261744, 271890, 332176, 381123, 396435, 495620,
      520278, 460839, 704158, 559134, 681089, 712384, 765381, 771374, 851314, 907947,
      903675, 1049642, 1003160, 881573, 1072283, 1139115, 1382701, 1395655, 1355040,
      1381571,
    ],
  },
  {
    id: 4,
    stockTitle: 'Stock Option #4',
      action: 'Buy',
      amount: 204,
      projection: 400,
      confidence: 99,
    stockValue: [
      264651, 311845, 436558, 439385, 520413, 533380, 562363, 533793, 558029, 791126,
      649082, 566792, 723451, 737827, 890859, 935554, 1044397, 1022973, 1129827,
      1145309, 1195630, 1358925, 1373160, 1172679, 1340106, 1396974, 1623641,
      1687545, 1581634, 1550291,
    ],
  },
  {
    id: 5,
    stockTitle: 'Stock Option #5',
      action: 'Sell',
      amount: 204,
      projection: 400,
      confidence: 77,
    stockValue: [
      251871, 262216, 402383, 396459, 378793, 406720, 447538, 451451, 457111, 589821,
      640744, 504879, 626099, 662007, 754576, 768231, 833019, 851537, 972306,
      1014831, 1027570, 1189068, 1119099, 987244, 1197954, 1310721, 1480816, 1577547,
      1854053, 1791831,
    ],
  },
  {
    id: 6,
    stockTitle: 'Stock Option #6',
      action: 'Buy',
      amount: 204,
      projection: 400,
      confidence: 73,
    stockValue: [
      13671, 16918, 27272, 34315, 42212, 56369, 64241, 77857, 70680, 91093, 108306,
      94734, 132289, 133860, 147706, 158504, 192578, 207173, 220052, 233496, 250091,
      285557, 268555, 259482, 274019, 321648, 359801, 399502, 447249, 497403,
    ],
  },
  {
    id: 7,
    stockTitle: 'Stock Option #7',
      action: 'Sell',
      amount: 204,
      projection: 400,
      confidence: 84,
    stockValue: [
      93682, 107901, 144919, 151769, 170804, 183736, 201752, 219792, 227887, 295382,
      309600, 278050, 331964, 356826, 404896, 428090, 470245, 485582, 539056, 582112,
      594289, 671915, 649510, 574911, 713843, 754965, 853020, 916793, 960158, 984265,
    ],
  },
  {
    id: 8,
    stockTitle: 'Stock Option #8',
      action: 'Buy',
      amount: 204,
      projection: 400,
      confidence: 93,
    stockValue: [
      52394, 63357, 82800, 105466, 128729, 144472, 172148, 197919, 212302, 278153,
      290499, 249824, 317499, 333024, 388925, 410576, 462099, 488477, 533956, 572307,
      591019, 681506, 653332, 581234, 719038, 783496, 911609, 973328, 1056071,
      1112940,
    ],
  },
  {
    id: 9,
    stockTitle: 'Stock Option #9',
      action: 'Sell',
      amount: 204,
      projection: 400,
      confidence: 78,
    stockValue: [
      15372, 16901, 25489, 30148, 40857, 51136, 64627, 75804, 89633, 100407, 114908,
      129957, 143568, 158509, 174822, 192488, 211512, 234702, 258812, 284328, 310431,
      338186, 366582, 396749, 428788, 462880, 499125, 537723, 578884, 622825,
    ],
  },
  {
    id: 10,
    stockTitle: 'Stock Option #10',
      action: 'Buy',
      amount: 204,
      projection: 400,
      confidence: 68,
    stockValue: [
      70211, 89234, 115676, 136021, 158744, 174682, 192890, 218073, 240926, 308190,
      317552, 279834, 334072, 354955, 422153, 443911, 501486, 538091, 593724, 642882,
      686539, 788615, 754813, 687955, 883645, 978347, 1142551, 1233074, 1278155,
      1356724,
    ],
  },
  {
    id: 11,
    stockTitle: 'Stock Option #20',
      action: 'Sell',
      amount: 204,
      projection: 400,
      confidence: 87,
    stockValue: [
      49662, 58971, 78547, 93486, 108722, 124901, 146422, 167883, 189295, 230090,
      249837, 217828, 266494, 287537, 339586, 363299, 412855, 440900, 490111, 536729,
      580591, 671635, 655812, 576431, 741632, 819296, 971762, 1052605, 1099234,
      1173591,
    ],
  },
  {
    id: 12,
    stockTitle: 'Stock Option #12',
    action: 'Buy',
      amount: 204,
      projection: 400,
      confidence: 92,
    stockValue: [
      29589, 37965, 55800, 64672, 77995, 91126, 108203, 128900, 148232, 177159,
      193489, 164471, 210765, 229977, 273802, 299381, 341092, 371567, 413812, 457693,
      495920, 564785, 541022, 491680, 618096, 704926, 833365, 904313, 974622,
      1036567,
    ],
  },

];
