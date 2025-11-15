"""
Quick endpoint verification script
Tests all report endpoints to ensure they work correctly
"""
import requests
import json

BASE_URL = 'http://localhost:4000'

endpoints = [
    '/api/reports',
    '/api/reports/monthly-safety',
    '/api/reports/hotspot-analysis',
    '/api/reports/emergency-response',
    '/api/reports/monthly-trends',
    '/api/reports/risk-factors',
    '/api/reports/severity-distribution',
]

print('Testing DriveSmart Backend Endpoints')
print('=' * 60)

for endpoint in endpoints:
    try:
        response = requests.get(f'{BASE_URL}{endpoint}', timeout=5)
        status = '✓' if response.status_code == 200 else '✗'
        size = len(response.text)
        print(f'{status} {endpoint:40} [{response.status_code}] {size:8} bytes')
        
        # Show sample of first endpoint
        if endpoint == '/api/reports':
            data = response.json()
            print(f'  Sample: {list(data.keys())}')
    except Exception as e:
        print(f'✗ {endpoint:40} [ERROR] {str(e)[:40]}')

print('=' * 60)
print('\nNote: Backend must be running (python backend/main.py)')
