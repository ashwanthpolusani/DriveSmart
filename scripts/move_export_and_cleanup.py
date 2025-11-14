import os
import shutil

root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
backend = os.path.join(root, 'backend')
frontend = os.path.join(root, 'frontend')

src_export = os.path.join(backend, 'templates', 'export1.html')
dst_export = os.path.join(frontend, 'export1.html')

# Move export1.html to frontend root
if os.path.exists(src_export):
    os.makedirs(frontend, exist_ok=True)
    if os.path.exists(dst_export):
        print('Destination export1.html already exists in frontend, backing up existing file to export1.html.bak')
        shutil.move(dst_export, dst_export + '.bak')
    shutil.move(src_export, dst_export)
    print('Moved export1.html to frontend/')
else:
    print('No export1.html found in backend/templates (skipping move)')

# Archive remaining backend templates and static into unwanted/archive to clean backend root
archive_dir = os.path.join(backend, 'unwanted', 'archive')
os.makedirs(archive_dir, exist_ok=True)

for name in ['templates', 'static']:
    src = os.path.join(backend, name)
    if os.path.exists(src):
        dst = os.path.join(archive_dir, name)
        if os.path.exists(dst):
            # remove dst to allow move
            if os.path.isdir(dst):
                shutil.rmtree(dst)
            else:
                os.remove(dst)
        try:
            shutil.move(src, dst)
            print(f'Moved {name} -> unwanted/archive/{name}')
        except Exception as e:
            print(f'Failed to move {name}: {e}')
    else:
        print(f'{name} not present in backend (skipping)')

print('Cleanup complete.')
