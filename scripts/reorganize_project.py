import os
import shutil

root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
backend = os.path.join(root, 'backend')
frontend = os.path.join(root, 'frontend')

os.makedirs(backend, exist_ok=True)
# frontend folder already exists; keep it

# Items to move into backend
to_move = [
    'main.py',
    'templates',
    'static',
    'requirements.txt',
    'README-DRIVESMART-INTEGRATION.md',
    'unwanted'
]

moved = []
for name in to_move:
    src = os.path.join(root, name)
    if os.path.exists(src):
        dst = os.path.join(backend, name)
        # if dst exists, remove it first
        if os.path.exists(dst):
            if os.path.isdir(dst):
                shutil.rmtree(dst)
            else:
                os.remove(dst)
        try:
            shutil.move(src, dst)
            moved.append(name)
        except Exception as e:
            print(f'Failed to move {name}: {e}')
    else:
        print(f'Not found (skipping) {name}')

print('Moved into backend:')
for m in moved:
    print('-', m)
