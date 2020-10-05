import pandas as pd
import json
import requests
from io import StringIO 
from datetime import datetime as dt

url = 'https://data.townofcary.org/api/v2/catalog/datasets/cpd-crash-incidents/exports/csv?rows=-1&timezone=UTC&delimiter=%3B'
headers = {'Accept': 'text/csv'}

r = requests.get(url, headers)

text_data = StringIO(r.text)
crash_data = pd.read_csv(text_data, sep=';')
crash_data.crash_date = pd.to_datetime(crash_data.crash_date)
crash_data.loc[:, 'week'] = crash_data.crash_date.dt.week

aggregated_crash_data = crash_data.groupby(['year', 'week']).apply(lambda x: pd.Series({
    'crashes': x['tamainid'].count(),
    'week_start': x['crash_date'].min()
})).reset_index()

# Give all the dates the same year for plotting purposes
aggregated_crash_data.loc[:, 'week_start'] =aggregated_crash_data.week_start.apply(lambda x: x.replace(year=2000).date())
aggregated_crash_data.loc[:, 'four_week_average'] = aggregated_crash_data['crashes'].rolling(4, min_periods=3).mean().values
aggregated_crash_data.loc[:, 'four_week_average'] = aggregated_crash_data.groupby('year').transform(lambda x: x.fillna(method='bfill'))

# Add groupings corresponding to each line we need to draw separately
aggregated_crash_data.loc[:, 'group'] = aggregated_crash_data.year
aggregated_crash_data.loc[
    (aggregated_crash_data.year == 2020) &
    (aggregated_crash_data.week <= 11), 'group'] = 20201
aggregated_crash_data.loc[
    (aggregated_crash_data.year == 2020) &
    (aggregated_crash_data.week > 11), 'group'] = 20202
aggregated_crash_data.loc[
    (aggregated_crash_data.year == 2020) &
    (aggregated_crash_data.week > 21), 'group'] = 20203

# Add in the last entry of each 2020 group to the next group
last_20201 = aggregated_crash_data.loc[(aggregated_crash_data.week == 11) & (aggregated_crash_data.year==2020)]
last_20202 = aggregated_crash_data.loc[(aggregated_crash_data.week == 21) & (aggregated_crash_data.year==2020)]
last_20201.loc[:, 'group']  = 20202
last_20202.loc[:, 'group']  = 20203

aggregated_crash_data = pd.concat([aggregated_crash_data, last_20201, last_20202])
aggregated_crash_data.loc[(aggregated_crash_data.week >= 52) & (aggregated_crash_data.week_start < dt(2000, 12, 1).date()), 'week_start'] = dt(2000, 12, 30).date()
aggregated_crash_data = aggregated_crash_data.sort_values(by=['year', 'week'])

aggregated_crash_data.to_csv('data/weekly_crashes.csv', index=False)