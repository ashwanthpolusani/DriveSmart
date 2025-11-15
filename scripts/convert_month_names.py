import json
from datetime import datetime

INPUT = r"d:/4-1/ROAD-ACCIDENTS-PREDICTION-AND-CLASSIFICATION-master/backend/data/reports/monthly_safety_report.json"

with open(INPUT,'r',encoding='utf-8') as f:
    data = json.load(f)

for m in data.get('trends',[]):
    try:
        dt = datetime.strptime(m['month'],'%Y-%m')
        m['month_name'] = dt.strftime('%b %Y')
    except Exception:
        m['month_name'] = m.get('month')

# update statistics peaks too
stats = data.get('statistics',{})
for key in ['peak_month','highest_casualty_month']:
    val = stats.get(key)
    if val:
        try:
            dt = datetime.strptime(val,'%Y-%m')
            stats[key+'_name'] = dt.strftime('%b %Y')
        except Exception:
            stats[key+'_name'] = val

with open(INPUT,'w',encoding='utf-8') as f:
    json.dump(data,f,indent=2)

print('Updated month_name for trends and statistics.')
