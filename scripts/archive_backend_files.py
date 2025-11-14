import os, shutil
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
backend = os.path.join(root, 'backend')
archive = os.path.join(backend, 'unwanted', 'archive')
os.makedirs(archive, exist_ok=True)

for name in ['README-DRIVESMART-INTEGRATION.md']:
    src = os.path.join(backend, name)
    if os.path.exists(src):
        dst = os.path.join(archive, name)
        if os.path.exists(dst):
            os.remove(dst)
        shutil.move(src, dst)
        print(f'Moved {name} to unwanted/archive')
    else:
        print(f'{name} not found in backend')
