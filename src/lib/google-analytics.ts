import { GoogleAuth } from 'google-auth-library';

export type TrafficSource = {
  source: string;
  sessions: number;
  percent: number;
};

export type Period = '7d' | '30d' | '90d';

const PERIOD_MAP: Record<Period, string> = {
  '7d': '7daysAgo',
  '30d': '30daysAgo',
  '90d': '90daysAgo',
};

const cache = new Map<string, { data: TrafficSource[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

type GA4Row = {
  dimensionValues: { value: string }[];
  metricValues: { value: string }[];
};

function getAuth() {
  return new GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
        /\\n/g,
        '\n'
      ),
    },
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });
}

export async function getTrafficSources(
  period: Period
): Promise<TrafficSource[]> {
  const cached = cache.get(period);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  const auth = getAuth();
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  const propertyId = process.env.GA_PROPERTY_ID;
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: PERIOD_MAP[period], endDate: 'yesterday' }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: '20',
      }),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GA4 API error (${res.status}): ${error}`);
  }

  const data = await res.json();
  const rows: GA4Row[] = data.rows || [];

  const totalSessions = rows.reduce(
    (sum, row) => sum + parseInt(row.metricValues[0].value, 10),
    0
  );

  if (totalSessions === 0) return [];

  const top5 = rows.slice(0, 5).map((row) => {
    const sessions = parseInt(row.metricValues[0].value, 10);
    return {
      source: row.dimensionValues[0].value,
      sessions,
      percent: Math.round((sessions / totalSessions) * 100),
    };
  });

  const othersSum = rows
    .slice(5)
    .reduce(
      (sum, row) => sum + parseInt(row.metricValues[0].value, 10),
      0
    );

  const result =
    othersSum > 0
      ? [
          ...top5,
          {
            source: 'Others',
            sessions: othersSum,
            percent: Math.round((othersSum / totalSessions) * 100),
          },
        ]
      : top5;

  cache.set(period, { data: result, ts: Date.now() });
  return result;
}
