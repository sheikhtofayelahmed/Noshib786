// components/NumberChart.js

export default function NumberChart() {
  return (
    <main style={styles.main}>
      <h1 style={styles.title}>HAPPY NEW YEAR 2025</h1>

      <div style={styles.tableWrapper}>
        <h2 style={styles.sectionTitle}>SINGLE</h2>
        <TableSection rows={singleRows} />

        <h2 style={styles.sectionTitle}>DOUBLE</h2>
        <TableSection rows={doubleRows} />

        <h2 style={styles.sectionTitle}>DOWN</h2>
        <TableSection rows={downRows} />
      </div>
    </main>
  );
}

function TableSection({ rows }) {
  return (
    <div style={styles.responsiveTable}>
      <table style={styles.table}>
        <thead>
          <tr>
            {[1,2,3,4,5,6,7,8,9,0].map(num => (
              <th style={styles.th} key={num}>{num}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((n, j) => (
                <td style={styles.td} key={j}>{n}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const singleRows = [
  [128,129,120,130,140,123,124,125,126,127],
  [137,138,139,149,159,150,160,134,135,136],
  [146,147,148,158,168,169,179,170,180,145],
  [236,156,157,167,230,178,250,189,234,190],
  [245,237,238,239,249,240,269,260,270,235],
  [290,246,247,248,258,259,278,279,289,280],
  [380,345,256,257,267,268,340,350,360,370],
  [470,390,346,347,348,349,359,369,379,389],
  [489,480,490,356,357,358,368,378,450,460],
  [560,570,580,590,456,367,458,459,469,479],
  [579,589,670,680,690,457,467,468,478,569],
  [678,679,689,789,780,790,890,567,568,578],
];

const doubleRows = [
  [100,110,166,112,113,114,115,116,117,118],
  [119,200,229,220,122,277,133,224,144,226],
  [155,228,300,266,177,330,188,233,199,244],
  [227,255,337,338,339,448,223,288,225,299],
  [335,336,355,400,366,466,377,440,388,334],
  [344,499,445,446,447,556,449,477,559,488],
  [399,660,599,455,500,600,557,558,577,550],
  [588,688,779,699,799,880,566,800,667,668],
  [669,778,788,770,889,899,700,990,900,677],
  [777,444,111,888,555,222,999,666,333,"000"],
];

const downRows = [
  [10,20,30,40,50,60,70,80,90,0],
  [29,11,12,13,14,15,16,17,18,19],
  [38,39,49,22,23,24,25,26,27,28],
  [47,48,58,59,69,33,34,35,36,37],
  [56,57,67,68,78,79,89,44,45,46],
  ["XX",66,"XX",77,"XX",88,"XX",99,"XX",55],
];

const styles = {
  main: {
    padding: '1rem',
    fontFamily: 'Verdana, sans-serif',
    background: 'linear-gradient(to bottom, #ffecd2, #fcb69f)',
    minHeight: '100vh',
    textAlign: 'center',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#b30059',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    margin: '1.5rem 0 0.5rem',
    color: '#3e0066',
    textDecoration: 'underline',
  },
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  responsiveTable: {
    overflowX: 'auto',
    width: '100%',
    maxWidth: '100%',
    marginBottom: '1.5rem',
  },
  table: {
    width: '100%',
    maxWidth: '500px',
    borderCollapse: 'collapse',
    backgroundColor: '#ffffffcc',
    boxShadow: '0 0 8px rgba(0,0,0,0.2)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  th: {
    padding: '10px',
    backgroundColor: '#8e44ad',
    color: 'white',
    fontSize: '0.9rem',
    border: '1px solid #ccc',
  },
  td: {
    padding: '8px',
    fontSize: '0.9rem',
    border: '1px solid #ddd',
    backgroundColor: '#fdfcfa',
  },
};
