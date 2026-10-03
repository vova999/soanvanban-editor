import tarfile,gzip,pathlib,hashlib,json,re,io,concurrent.futures,argparse
parser=argparse.ArgumentParser(description='Create audited text-source snapshots; never uploads or deploys');parser.add_argument('--input-dir',required=True);parser.add_argument('--output-dir',required=True);parser.add_argument('--live7');parser.add_argument('--only');args=parser.parse_args();root=pathlib.Path(args.output_dir);(root/'releases').mkdir(parents=True,exist_ok=True);inputs=list(pathlib.Path(args.input_dir).glob('*.tar.gz'))+([pathlib.Path(args.live7)] if args.live7 else []);inputs=[p for p in inputs if not args.only or p.name==args.only]
fonts={'.ttf','.otf','.ttc','.woff','.woff2','.eot','.pfb','.pfa','.pcf','.bdf'}
compiled={'.exe','.dll','.so','.dylib','.a','.o','.obj','.lib','.class','.jar','.wasm','.pyc','.pyo'}
packed={'.zip','.7z','.cab','.tgz','.gz','.tar','.bz2','.xz','.rar','.docx','.xlsx','.pptx','.pdf','.doc','.xls','.ppt','.bin'}
secrets=re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----|(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}|AKIA[A-Z0-9]{16}|AIza[0-9A-Za-z_-]{35}|sk-(?:proj-|ant-)[A-Za-z0-9_-]{30,}|pplx-[A-Za-z0-9]{40,})')
inlinefont=re.compile(rb'data:(?:font/|application/(?:x-font|font|vnd\.ms-fontobject))[^,]{0,100},',re.I)
def classify(name,data):
 parts=pathlib.PurePosixPath(name).parts;ext=pathlib.Path(name).suffix.lower()
 if any(p in {'.git','node_modules','__pycache__','.aws'} for p in parts):return 'private-or-generated-directory'
 leaf=parts[-1]
 if leaf.startswith('.env') and not any(x in leaf for x in ['example','sample','template']):return 'environment-file'
 if ext in fonts:return 'font-binary-or-font-data'
 if ext in compiled or re.search(r'\.so\.\d',name):return 'compiled-program-or-library'
 if ext in packed:return 'packed-or-binary-fixture'
 if data.startswith((b'\x7fELF',b'MZ',b'\x00asm',b'wOFF',b'wOF2',b'OTTO',b'ttcf',b'\x00\x01\x00\x00',b'\xca\xfe\xba\xbe',b'\xfe\xed\xfa\xce',b'\xcf\xfa\xed\xfe')):return 'compiled-or-font-magic'
 if secrets.search(data):return 'credential-or-private-key-pattern'
 if inlinefont.search(data):return 'inline-font-payload'
 # Some original license RTF notices have one terminal NUL; retain their exact bytes.
 if data.startswith(b'{\\rtf') and data.count(b'\x00')==1 and data.endswith(b'\x00'):data=data[:-1]
 if b'\x00' in data:return 'nontext-source-asset'
 for encoding in ['utf-8','cp1252']:
  try:text=data.decode(encoding);break
  except UnicodeDecodeError:pass
 else:return 'nontext-source-asset'
 controls=sum(ord(c)<32 and c not in '\t\r\n\f' for c in text)
 if controls>max(2,len(text)//1000):return 'nontext-source-asset'
 return None

def one(path):
 label='live7-modified-web-apps' if path.name.startswith('svb-euro-editor') else path.name[:-7]
 out=root/'releases'/(label+'-text-source.tar.gz');keep=[];omit=[];directories=[]
 with tarfile.open(path) as tar:
  for m in tar:
   name=m.name
   if pathlib.PurePosixPath(name).is_absolute() or '..' in pathlib.PurePosixPath(name).parts:raise RuntimeError('Unsafe source path')
   if m.isdir():directories.append(m);continue
   if not m.isfile():omit.append({'path':name,'reason':'link-or-special-file'});continue
   data=tar.extractfile(m).read();reason=classify(name,data)
   if reason:omit.append({'path':name,'reason':reason});continue
   keep.append(m)
  with out.open('wb') as raw,gzip.GzipFile(filename='',mode='wb',fileobj=raw,mtime=0) as gz,tarfile.open(fileobj=gz,mode='w') as target:
   for m in directories+keep:
    info=tarfile.TarInfo(m.name);info.uid=info.gid=0;info.uname=info.gname='';info.mtime=0;info.mode=0o755 if m.isdir() or m.mode&0o111 else 0o644
    if m.isdir():info.type=tarfile.DIRTYPE;target.addfile(info)
    else:
     data=tar.extractfile(m).read();info.size=len(data);target.addfile(info,io.BytesIO(data))
 result={'inputFile':path.name,'inputSHA256':hashlib.sha256(path.read_bytes()).hexdigest(),'releaseFile':out.name,'releaseSHA256':hashlib.sha256(out.read_bytes()).hexdigest(),'releaseBytes':out.stat().st_size,'keptFiles':len(keep),'excluded':omit}
 (root/'releases'/(label+'-exclusions.json')).write_text(json.dumps(result,indent=2)+'\n');print(label,len(keep),len(omit),out.stat().st_size,flush=True);return result
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(one,inputs))
audit=root/'filter-audit.json';previous=json.loads(audit.read_text()) if args.only and audit.exists() else [];results=[r for r in previous if r['inputFile'] not in {v['inputFile'] for v in results}]+results;audit.write_text(json.dumps(results,indent=2)+'\n');print('Filtered source archives:',len(results),flush=True)
