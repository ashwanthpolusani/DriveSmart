import pandas as pd
import json
from collections import Counter
import os

# Get the project root directory
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Read the CSV file
csv_path = os.path.join(project_root, 'backend/data/accidents.csv')
df = pd.read_csv(csv_path)

print("CSV loaded successfully")
print(f"Total rows: {len(df)}")
print(f"Columns: {df.columns.tolist()}")

# ===== RISK FACTORS EXTRACTION =====
risk_factors = {
    'light_conditions': [],
    'weather_conditions': [],
    'road_surface_conditions': [],
    'special_conditions': []
}

# Extract light conditions
light_counts = df['light_conditions'].value_counts().sort_values(ascending=False)
for factor, count in light_counts.items():
    if pd.notna(factor):
        risk_factors['light_conditions'].append({
            'factor': int(factor),
            'count': int(count)
        })

# Extract weather conditions
weather_counts = df['weather_conditions'].value_counts().sort_values(ascending=False)
for factor, count in weather_counts.items():
    if pd.notna(factor):
        risk_factors['weather_conditions'].append({
            'factor': int(factor),
            'count': int(count)
        })

# Extract road surface conditions
road_counts = df['road_surface_conditions'].value_counts().sort_values(ascending=False)
for factor, count in road_counts.items():
    if pd.notna(factor):
        risk_factors['road_surface_conditions'].append({
            'factor': int(factor),
            'count': int(count)
        })

# Extract special conditions
special_counts = df['special_conditions_at_site'].value_counts().sort_values(ascending=False)
for factor, count in special_counts.items():
    if pd.notna(factor):
        risk_factors['special_conditions'].append({
            'factor': int(factor),
            'count': int(count)
        })

# Create risk factors report
risk_report = {
    'report_title': 'Top Risk Factors Analysis',
    'generated_date': pd.Timestamp.now().isoformat(),
    'factors': risk_factors
}

# Save risk factors
reports_dir = os.path.join(project_root, 'backend/data/reports')
os.makedirs(reports_dir, exist_ok=True)
risk_factors_path = os.path.join(reports_dir, 'risk_factors_analysis.json')
with open(risk_factors_path, 'w') as f:
    json.dump(risk_report, f, indent=2)
print(f"✓ Risk factors saved to {risk_factors_path}")

# ===== SEVERITY DISTRIBUTION EXTRACTION =====
# Map collision severity to readable names
severity_map = {
    1: 'Fatal',
    2: 'Serious',
    3: 'Slight'
}

severity_counts = df['collision_severity'].value_counts().sort_values(ascending=True)
distribution = []
total_incidents = len(df)

for severity_code, count in severity_counts.items():
    if pd.notna(severity_code):
        severity_code = int(severity_code)
        severity_label = severity_map.get(severity_code, f'Unknown ({severity_code})')
        percentage = (count / total_incidents) * 100
        distribution.append({
            'severity_level': severity_label,
            'count': int(count),
            'percentage': round(percentage, 2)
        })

# Create severity distribution report
severity_report = {
    'report_title': 'Severity Distribution Analysis',
    'generated_date': pd.Timestamp.now().isoformat(),
    'distribution': distribution,
    'total_incidents': int(total_incidents)
}

# Save severity distribution
severity_path = os.path.join(reports_dir, 'severity_distribution.json')
with open(severity_path, 'w') as f:
    json.dump(severity_report, f, indent=2)
print(f"✓ Severity distribution saved to {severity_path}")

# Print summary
print("\n=== RISK FACTORS SUMMARY ===")
for category, factors in risk_factors.items():
    total = sum(f['count'] for f in factors)
    print(f"{category}: {total} total incidents")
    for factor in factors[:5]:
        print(f"  - Factor {factor['factor']}: {factor['count']}")

print("\n=== SEVERITY DISTRIBUTION SUMMARY ===")
for dist in distribution:
    print(f"{dist['severity_level']}: {dist['count']} ({dist['percentage']}%)")
